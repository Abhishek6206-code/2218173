import axios from 'axios';
import logger from './logger';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('API base URL:', api.defaults.baseURL);

api.interceptors.request.use(
  (config) => {
    const hasData = config.data ? true : false;
    logger.info('Making API request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasData: hasData
    });
    return config;
  },
  (error) => {
    logger.error('Request setup failed', { error: error.message });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    logger.info('Got API response', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      success: true
    });
    return response;
  },
  (error) => {
    const errorInfo = {
      status: error.response?.status || 'No status',
      url: error.config?.url || 'Unknown URL',
      method: error.config?.method?.toUpperCase() || 'Unknown method',
      message: error.response?.data?.message || error.message
    };
    
    logger.error('API call failed', errorInfo);
    console.error('API Error:', errorInfo);
    return Promise.reject(error);
  }
);

export const urlAPI = {
  createShortUrl: async (data) => {
    try {
      logger.info('Creating short URL', { url: data.url });
      const resp = await api.post('/shorturls', data);
      
      logger.info('Short URL created', { 
        shortLink: resp.data.shortLink,
        expiry: resp.data.expiry
      });
      
      return resp.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      logger.error('Short URL creation failed', { 
        error: errorMsg,
        originalUrl: data.url
      });
      throw err;
    }
  },

  getUrlStats: async (code) => {
    try {
      logger.info('Getting URL stats', { shortCode: code });
      const response = await api.get(`/shorturls/${code}`);
      
      logger.info('Stats retrieved', { 
        shortCode: code,
        clickCount: response.data.clicks
      });
      
      return response.data;
    } catch (error) {
      logger.error('Stats fetch failed', { 
        shortCode: code,
        error: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  getAllUrls: async () => {
    try {
      logger.info('Fetching all URLs from backend');
      const resp = await api.get('/api/urls');
      
      const urlCount = resp.data.length;
      logger.info('URLs retrieved', { count: urlCount });
      console.log(`Got ${urlCount} URLs from server`);
      
      return resp.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      logger.error('Failed to get URLs', { error: errorMsg });
      throw err;
    }
  },

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
