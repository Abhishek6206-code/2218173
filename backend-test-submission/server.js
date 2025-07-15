const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const path = require('path');

// Import our custom logging middleware
const { createLogger } = require('../logging-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize logger for backend
const logger = createLogger({
  serviceName: 'URL-SHORTENER-BACKEND',
  environment: process.env.NODE_ENV || 'development',
  logLevel: 'info'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Use our custom logging middleware
app.use(logger.expressMiddleware());

// In-memory storage (in production, use a proper database)
const urlDatabase = new Map();
const clickAnalytics = new Map();

// Helper function to generate unique short code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Helper function to validate short code
function isValidShortCode(code) {
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
}

// Helper function to check if URL has expired
function isExpired(expiry) {
  return new Date() > new Date(expiry);
}

// Cleanup expired URLs every minute
cron.schedule('* * * * *', () => {
  let cleanedCount = 0;
  for (const [shortCode, urlData] of urlDatabase.entries()) {
    if (isExpired(urlData.expiry)) {
      urlDatabase.delete(shortCode);
      clickAnalytics.delete(shortCode);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    logger.info('Cleanup completed', { expiredUrlsRemoved: cleanedCount });
  }
});

// 1. Create Short URL
app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    // Validation
    if (!url) {
      logger.warn('URL creation failed - missing URL', { requestBody: req.body });
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a valid URL to shorten'
      });
    }

    if (!isValidUrl(url)) {
      logger.warn('URL creation failed - invalid URL format', { url });
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP or HTTPS URL'
      });
    }

    if (validity && (!Number.isInteger(validity) || validity < 1)) {
      logger.warn('URL creation failed - invalid validity', { validity });
      return res.status(400).json({
        error: 'Invalid validity period',
        message: 'Validity must be a positive integer (minutes)'
      });
    }

    let finalShortCode;

    // Handle custom shortcode
    if (shortcode) {
      if (!isValidShortCode(shortcode)) {
        logger.warn('URL creation failed - invalid shortcode format', { shortcode });
        return res.status(400).json({
          error: 'Invalid shortcode format',
          message: 'Shortcode must be 3-10 alphanumeric characters'
        });
      }

      if (urlDatabase.has(shortcode)) {
        logger.warn('URL creation failed - shortcode already exists', { shortcode });
        return res.status(409).json({
          error: 'Shortcode already exists',
          message: 'Please choose a different shortcode'
        });
      }

      finalShortCode = shortcode;
    } else {
      // Generate unique shortcode
      do {
        finalShortCode = generateShortCode();
      } while (urlDatabase.has(finalShortCode));
    }

    // Calculate expiry time
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + validity);

    // Store URL data
    const urlData = {
      originalUrl: url,
      shortCode: finalShortCode,
      createdAt: new Date().toISOString(),
      expiry: expiryTime.toISOString(),
      clicks: 0
    };

    urlDatabase.set(finalShortCode, urlData);
    clickAnalytics.set(finalShortCode, []);

    const shortLink = `${req.protocol}://${req.get('host')}/${finalShortCode}`;

    logger.info('URL shortened successfully', {
      originalUrl: url,
      shortCode: finalShortCode,
      validity: validity,
      expiry: expiryTime.toISOString()
    });

    res.status(201).json({
      shortLink,
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