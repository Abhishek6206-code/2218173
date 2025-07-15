const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid'); // for generating unique IDs if needed
const cron = require('node-cron');
const path = require('path');

// Import the custom logging middleware we built
const { createLogger } = require('../logging-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting AFFORDMED URL Shortener Backend...'); // quick debug log

// set up logger
const logger = createLogger({
  serviceName: 'URL-SHORTENER-BACKEND',
  environment: process.env.NODE_ENV || 'development', 
  logLevel: 'info'
});

// Security and CORS setup
app.use(helmet()); // basic security headers
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // allow frontend
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// plug in our logging middleware
app.use(logger.expressMiddleware());

// Storage - using Maps for now (TODO: switch to real DB later)
const urlDatabase = new Map(); // stores main URL data
const clickAnalytics = new Map(); // stores click tracking data

if (process.env.NODE_ENV === 'development') {
  console.log('Using in-memory storage for development');
}

// generates a random 6 character shortcode
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  // just loop 6 times and pick random chars
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// check if URL is valid format
function isValidUrl(urlString) {
  try {
    const urlObj = new URL(urlString);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false; // invalid URL
  }
}

// validate custom shortcode format
function isValidShortCode(code) {
  // 3-10 alphanumeric characters only
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
}

// check if a URL has expired
function isExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

// run cleanup every minute to remove expired URLs
cron.schedule('* * * * *', () => {
  let removed = 0;
  // check all URLs for expiry
  for (const [code, data] of urlDatabase.entries()) {
    if (isExpired(data.expiry)) {
      urlDatabase.delete(code);
      clickAnalytics.delete(code); // also remove analytics
      removed++;
    }
  }
  // only log if we actually cleaned something
  if (removed > 0) {
    logger.info('Expired URL cleanup', { removedCount: removed });
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cleaned up ${removed} expired URLs`);
    }
  }
});

// API endpoint to create short URLs
app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    // basic validation first
    if (!url) {
      logger.warn('Missing URL in request', { body: req.body });
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a valid URL to shorten'
      });
    }

    // check URL format
    if (!isValidUrl(url)) {
      logger.warn('Invalid URL format provided', { url: url });
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP or HTTPS URL'
      });
    }

    // validate validity period
    if (validity && (!Number.isInteger(validity) || validity < 1)) {
      logger.warn('Invalid validity period', { validity: validity });
      return res.status(400).json({
        error: 'Invalid validity period', 
        message: 'Validity must be a positive integer (minutes)'
      });
    }

    let shortCodeToUse;

    // handle custom shortcode if provided
    if (shortcode) {
      if (!isValidShortCode(shortcode)) {
        logger.warn('Bad shortcode format', { shortcode: shortcode });
        return res.status(400).json({
          error: 'Invalid shortcode format',
          message: 'Shortcode must be 3-10 alphanumeric characters'
        });
      }

      // check if shortcode already taken
      if (urlDatabase.has(shortcode)) {
        logger.warn('Shortcode already exists', { shortcode: shortcode });
        return res.status(409).json({
          error: 'Shortcode already exists',
          message: 'Please choose a different shortcode'
        });
      }

      shortCodeToUse = shortcode;
    } else {
      // generate a unique random shortcode
      do {
        shortCodeToUse = generateShortCode();
      } while (urlDatabase.has(shortCodeToUse)); // keep trying until unique
    }

    // calculate when this URL expires
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + validity);

    // create the URL record
    const urlRecord = {
      originalUrl: url,
      shortCode: shortCodeToUse,
      createdAt: new Date().toISOString(),
      expiry: expiryTime.toISOString(),
      clicks: 0
    };

    // save to our "database"
    urlDatabase.set(shortCodeToUse, urlRecord);
    clickAnalytics.set(shortCodeToUse, []); // empty analytics array to start

    // build the full short URL 
    const shortLink = `${req.protocol}://${req.get('host')}/${shortCodeToUse}`;

    logger.info('Created new short URL', {
      original: url,
      shortCode: shortCodeToUse,
      validityMinutes: validity,
      expiresAt: expiryTime.toISOString()
    });

    // send response back to client
    res.status(201).json({
      shortLink: shortLink,
      expiry: expiryTime.toISOString()
    });

  } catch (error) {
    logger.error('Error creating short URL', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
});

// 2. Retrieve Short URL Statistics
app.get('/shorturls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (!urlDatabase.has(shortCode)) {
      logger.warn('Statistics request failed - shortcode not found', { shortCode });
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist'
      });
    }

    const urlData = urlDatabase.get(shortCode);

    // Check if expired
    if (isExpired(urlData.expiry)) {
      logger.warn('Statistics request failed - URL expired', { shortCode, expiry: urlData.expiry });
      urlDatabase.delete(shortCode);
      clickAnalytics.delete(shortCode);
      return res.status(410).json({
        error: 'Short URL expired',
        message: 'The requested short URL has expired'
      });
    }

    const clickData = clickAnalytics.get(shortCode) || [];

    logger.info('Statistics retrieved', { shortCode, clicks: urlData.clicks });

    res.json({
      clicks: urlData.clicks,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiry: urlData.expiry,
      clickData: clickData.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer || 'Direct',
        location: click.location || 'Unknown'
      }))
    });

  } catch (error) {
    logger.error('Error retrieving URL statistics', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URL statistics'
    });
  }
});

// 3. Redirect Short URL
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (!urlDatabase.has(shortCode)) {
      logger.warn('Redirect failed - shortcode not found', { shortCode });
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist'
      });
    }

    const urlData = urlDatabase.get(shortCode);

    // Check if expired
    if (isExpired(urlData.expiry)) {
      logger.warn('Redirect failed - URL expired', { shortCode, expiry: urlData.expiry });
      urlDatabase.delete(shortCode);
      clickAnalytics.delete(shortCode);
      return res.status(410).json({
        error: 'Short URL expired',
        message: 'The requested short URL has expired'
      });
    }

    // Record click analytics
    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: req.get('Referer') || null,
      userAgent: req.get('User-Agent') || null,
      ip: req.ip || req.connection.remoteAddress,
      location: 'Unknown' // In production, you could use IP geolocation
    };

    // Update click count and analytics
    urlData.clicks++;
    const analytics = clickAnalytics.get(shortCode) || [];
    analytics.push(clickData);
    clickAnalytics.set(shortCode, analytics);

    logger.info('URL redirect', {
      shortCode,
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks,
      referrer: clickData.referrer
    });

    // Redirect to original URL
    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    logger.error('Error redirecting URL', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to redirect URL'
    });
  }
});

// 4. Get all URLs (for frontend to display)
app.get('/api/urls', async (req, res) => {
  try {
    const allUrls = [];
    
    for (const [shortCode, urlData] of urlDatabase.entries()) {
      if (!isExpired(urlData.expiry)) {
        const shortLink = `${req.protocol}://${req.get('host')}/${shortCode}`;
        allUrls.push({
          shortCode,
          originalUrl: urlData.originalUrl,
          shortLink,
          createdAt: urlData.createdAt,
          expiry: urlData.expiry,
          clicks: urlData.clicks
        });
      }
    }

    logger.info('Retrieved all URLs', { count: allUrls.length });
    res.json(allUrls);

  } catch (error) {
    logger.error('Error retrieving all URLs', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URLs'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalUrls: urlDatabase.size
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', { error: error.message, stack: error.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { method: req.method, url: req.url });
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;