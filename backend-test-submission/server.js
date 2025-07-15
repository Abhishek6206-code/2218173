const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { createLogger } = require('../logging-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

const logger = createLogger({
  serviceName: 'URL-SHORTENER-BACKEND',
  environment: process.env.NODE_ENV || 'development', 
  logLevel: 'info'
});

app.use(cors());
app.use(express.json());
app.use(logger.expressMiddleware());

const urlDatabase = new Map();
const clickAnalytics = new Map();

function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function isValidShortCode(code) {
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
}

function isExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

setInterval(() => {
  for (const [code, data] of urlDatabase.entries()) {
    if (isExpired(data.expiry)) {
      urlDatabase.delete(code);
      clickAnalytics.delete(code);
    }
  }
}, 60000);

app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    if (!url) {
      logger.warn('Missing URL in request');
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a valid URL to shorten'
      });
    }

    if (!isValidUrl(url)) {
      logger.warn('Invalid URL format');
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP or HTTPS URL'
      });
    }

    if (validity && (!Number.isInteger(validity) || validity < 1)) {
      logger.warn('Invalid validity period');
      return res.status(400).json({
        error: 'Invalid validity period', 
        message: 'Validity must be a positive integer (minutes)'
      });
    }

    let shortCodeToUse;

    if (shortcode) {
      if (!isValidShortCode(shortcode)) {
        logger.warn('Bad shortcode format');
        return res.status(400).json({
          error: 'Invalid shortcode format',
          message: 'Shortcode must be 3-10 alphanumeric characters'
        });
      }

      if (urlDatabase.has(shortcode)) {
        logger.warn('Shortcode already exists');
        return res.status(409).json({
          error: 'Shortcode already exists',
          message: 'Please choose a different shortcode'
        });
      }

      shortCodeToUse = shortcode;
    } else {
      do {
        shortCodeToUse = generateShortCode();
      } while (urlDatabase.has(shortCodeToUse));
    }

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + validity);

    const urlRecord = {
      originalUrl: url,
      shortCode: shortCodeToUse,
      createdAt: new Date().toISOString(),
      expiry: expiryTime.toISOString(),
      clicks: 0
    };

    urlDatabase.set(shortCodeToUse, urlRecord);
    clickAnalytics.set(shortCodeToUse, []);

    const shortLink = `${req.protocol}://${req.get('host')}/${shortCodeToUse}`;

    logger.info('Created new short URL', {
      original: url,
      shortCode: shortCodeToUse,
      validityMinutes: validity
    });

    res.status(201).json({
      shortLink: shortLink,
      expiry: expiryTime.toISOString()
    });

  } catch (error) {
    logger.error('Error creating short URL', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
});

app.get('/shorturls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (!urlDatabase.has(shortCode)) {
      logger.warn('Stats request - shortcode not found');
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist'
      });
    }

    const urlData = urlDatabase.get(shortCode);

    if (isExpired(urlData.expiry)) {
      logger.warn('Stats request - URL expired');
      urlDatabase.delete(shortCode);
      clickAnalytics.delete(shortCode);
      return res.status(410).json({
        error: 'Short URL expired',
        message: 'The requested short URL has expired'
      });
    }

    const clickData = clickAnalytics.get(shortCode) || [];

    logger.info('Stats retrieved');

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
    logger.error('Error getting stats', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URL statistics'
    });
  }
});

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (!urlDatabase.has(shortCode)) {
      logger.warn('Redirect failed - not found');
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist'
      });
    }

    const urlData = urlDatabase.get(shortCode);

    if (isExpired(urlData.expiry)) {
      logger.warn('Redirect failed - expired');
      urlDatabase.delete(shortCode);
      clickAnalytics.delete(shortCode);
      return res.status(410).json({
        error: 'Short URL expired',
        message: 'The requested short URL has expired'
      });
    }

    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: req.get('Referer') || null,
      userAgent: req.get('User-Agent') || null,
      ip: req.ip || req.connection.remoteAddress,
      location: 'Unknown'
    };

    urlData.clicks++;
    const analytics = clickAnalytics.get(shortCode) || [];
    analytics.push(clickData);
    clickAnalytics.set(shortCode, analytics);

    logger.info('URL redirect', {
      shortCode,
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks
    });

    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    logger.error('Error redirecting', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to redirect URL'
    });
  }
});

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

    logger.info('Retrieved all URLs');
    res.json(allUrls);

  } catch (error) {
    logger.error('Error getting all URLs', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URLs'
    });
  }
});

app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});

module.exports = app;
