import axios from 'axios';
import logger from './logger';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    logger.info('Making API request', {
      method: config.method?.toUpperCase(),
      url: config.url
    });
    return config;
  },
  (error) => {
    logger.error('Request setup failed');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    logger.info('Got API response', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    logger.error('API call failed', {
      status: error.response?.status || 'No status',
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

export const urlAPI = {
  createShortUrl: async (data) => {
    try {
      logger.info('Creating short URL');
      const resp = await api.post('/shorturls', data);
      
      logger.info('Short URL created');
      
      return resp.data;
    } catch (err) {
      logger.error('Short URL creation failed');
      throw err;
    }
  },

  getUrlStats: async (code) => {
    try {
      logger.info('Getting URL stats');
      const response = await api.get(`/shorturls/${code}`);
      
      logger.info('Stats retrieved');
      
      return response.data;
    } catch (error) {
      logger.error('Stats fetch failed');
      throw error;
    }
  },

  getAllUrls: async () => {
    try {
      logger.info('Fetching all URLs from backend');
      const resp = await api.get('/api/urls');
      
      logger.info('URLs retrieved');
      
      return resp.data;
    } catch (err) {
      logger.error('Failed to get URLs');
      throw err;
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
