class FrontendLogger {
  constructor() {
    this.serviceName = 'URL-SHORTENER-FRONTEND';
    this.environment = process.env.NODE_ENV || 'development';
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    
    let logEntry = {
      timestamp,
      service: this.serviceName,
      level: level.toUpperCase(),
      message,
      environment: this.environment,
      url: window.location.href,
      ...metadata
    };

    return logEntry;
  }

  storeLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
      logs.push(logEntry);
      if (logs.length > 1000) logs.shift();
      localStorage.setItem('affordmed_logs', JSON.stringify(logs));
    } catch (e) {
      // ignore
    }
  }

  log(level, message, metadata = {}) {
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
      // ignore
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
