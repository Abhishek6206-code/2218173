import axios from 'axios';
import logger from './logger';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    logger.info('API Request initiated', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data ? 'Request contains data' : 'No data'
    });
    return config;
  },
  (error) => {
    logger.error('API Request error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    logger.info('API Response received', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.message || error.message
    };
    
    logger.error('API Response error', errorDetails);
    return Promise.reject(error);
  }
);

// API functions
export const urlAPI = {
  // Create short URL
  createShortUrl: async (urlData) => {
    try {
      logger.info('Creating short URL', { originalUrl: urlData.url });
      const response = await api.post('/shorturls', urlData);
      logger.info('Short URL created successfully', { 
        shortLink: response.data.shortLink,
        expiry: response.data.expiry
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to create short URL', { 
        error: error.response?.data?.message || error.message,
        originalUrl: urlData.url
      });
      throw error;
    }
  },

  // Get URL statistics
  getUrlStats: async (shortCode) => {
    try {
      logger.info('Fetching URL statistics', { shortCode });
      const response = await api.get(`/shorturls/${shortCode}`);
      logger.info('URL statistics retrieved', { 
        shortCode,
        clicks: response.data.clicks
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch URL statistics', { 
        shortCode,
        error: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  // Get all URLs
  getAllUrls: async () => {
    try {
      logger.info('Fetching all URLs');
      const response = await api.get('/api/urls');
      logger.info('All URLs retrieved', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch all URLs', { 
        error: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      logger.info('Health check successful', { 
        status: response.data.status,
        totalUrls: response.data.totalUrls
      });
      return response.data;
    } catch (error) {
      logger.error('Health check failed', { 
        error: error.response?.data?.message || error.message
      });
      throw error;
    }
  }
};

// Utility functions
export const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateShortCode = (code) => {
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
};

export const validateValidity = (validity) => {
  const num = parseInt(validity);
  return Number.isInteger(num) && num > 0;
};

export default api;