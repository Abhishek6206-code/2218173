// Custom frontend logger that matches the backend logging middleware
class FrontendLogger {
  constructor() {
    this.serviceName = 'URL-SHORTENER-FRONTEND';
    this.environment = process.env.NODE_ENV || 'development';
    this.logLevel = 'info';
    this.enableTimestamp = true;
    
    // same log levels as backend
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
    
    if (this.environment === 'development') {
      console.log('Frontend logger initialized');
    }
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
    
    let logEntry = {
      timestamp,
      service: this.serviceName,
      level: level.toUpperCase(),
      message,
      environment: this.environment,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata
    };

    return logEntry;
  }

  shouldLog(level) {
    return this.levels[level] <= this.currentLevel;
  }

  storeLog(logEntry) {
    // Store in localStorage (same as the backend logging middleware)
    try {
      const logs = JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
      logs.push(logEntry);
      // Keep only last 1000 logs
      if (logs.length > 1000) logs.shift();
      localStorage.setItem('affordmed_logs', JSON.stringify(logs));
    } catch (e) {
      // Fallback if localStorage is not available
      if (this.environment === 'development') {
        console.warn('Failed to store log in localStorage:', e);
      }
    }
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) {
      return; // skip if log level too low
    }

    const entry = this.formatMessage(level, message, metadata);
    
    // save to storage
    this.storeLog(entry);
    
    // in dev mode, also output to console for debugging
    if (this.environment === 'development') {
      const displayMsg = `${entry.timestamp} [${entry.service}] [${entry.level}] ${message}`;
      
      // use appropriate console method
      if (level === 'error') {
        console.error(displayMsg, metadata);
      } else if (level === 'warn') {
        console.warn(displayMsg, metadata);
      } else {
        console.log(displayMsg, metadata);
      }
    }
    
    return entry;
  }

  error(message, metadata = {}) {
    return this.log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    return this.log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    return this.log('debug', message, metadata);
  }

  // Get stored logs (for analytics/debugging)
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear stored logs
  clearLogs() {
    try {
      localStorage.removeItem('affordmed_logs');
    } catch (e) {
      // Silently fail
    }
  }
}

// Create default logger instance
const logger = new FrontendLogger();

// Hook for React components
export const useLogger = () => {
  return {
    error: (message, metadata) => logger.error(message, metadata),
    warn: (message, metadata) => logger.warn(message, metadata),
    info: (message, metadata) => logger.info(message, metadata),
    debug: (message, metadata) => logger.debug(message, metadata),
    getLogs: () => logger.getLogs(),
    clearLogs: () => logger.clearLogs()
  };
};

export default logger;