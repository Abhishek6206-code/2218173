class FrontendLogger {
  constructor() {
    this.serviceName = 'URL-SHORTENER-FRONTEND';
    this.environment = process.env.NODE_ENV || 'development';
    this.logLevel = 'info';
    this.enableTimestamp = true;
    
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
    try {
      const logs = JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
      logs.push(logEntry);
      if (logs.length > 1000) logs.shift();
      localStorage.setItem('affordmed_logs', JSON.stringify(logs));
    } catch (e) {
      if (this.environment === 'development') {
        console.warn('Failed to store log in localStorage:', e);
      }
    }
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.formatMessage(level, message, metadata);
    
    this.storeLog(entry);
    
    if (this.environment === 'development') {
      const displayMsg = `${entry.timestamp} [${entry.service}] [${entry.level}] ${message}`;
      
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

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  clearLogs() {
    try {
      localStorage.removeItem('affordmed_logs');
    } catch (e) {
    }
  }
}

const logger = new FrontendLogger();

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
