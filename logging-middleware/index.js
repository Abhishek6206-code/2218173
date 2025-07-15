class AffordmedLogger {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'AFFORDMED-SERVICE';
    this.environment = options.environment || 'development';
    this.logLevel = options.logLevel || 'info';
    this.enableTimestamp = options.enableTimestamp !== false;
    
    // Log levels hierarchy
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
    const service = `[${this.serviceName}]`;
    const logLevel = `[${level.toUpperCase()}]`;
    
    let logEntry = {
      timestamp,
      service: this.serviceName,
      level: level.toUpperCase(),
      message,
      environment: this.environment,
      ...metadata
    };

    // For console output (fallback display only)
    const displayMessage = `${timestamp} ${service} ${logLevel} ${message}`;
    
    return {
      structured: logEntry,
      display: displayMessage
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.currentLevel;
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, metadata);
    
    // Store to internal log buffer (for analytics)
    this.storeLog(formatted.structured);
    
    // For development, also display to console as fallback
    if (this.environment === 'development') {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](formatted.display);
    }
    
    return formatted.structured;
  }

  storeLog(logEntry) {
    // In a real implementation, this would send to a logging service
    // For this demo, we'll store in memory
    if (typeof window !== 'undefined') {
      // Client-side storage
      const logs = JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
      logs.push(logEntry);
      // Keep only last 1000 logs
      if (logs.length > 1000) logs.shift();
      localStorage.setItem('affordmed_logs', JSON.stringify(logs));
    } else {
      // Server-side storage (in memory for demo)
      if (!global.affordmedLogs) global.affordmedLogs = [];
      global.affordmedLogs.push(logEntry);
      // Keep only last 1000 logs
      if (global.affordmedLogs.length > 1000) global.affordmedLogs.shift();
    }
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

  // Express middleware factory
  expressMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log incoming request
      this.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        // Create new logger instance to access the method
        const logger = new AffordmedLogger({ serviceName: 'BACKEND-API' });
        logger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        });

        originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  // React hook for client-side logging
  useLogger() {
    if (typeof window === 'undefined') {
      throw new Error('useLogger can only be used in client-side React components');
    }
    
    return {
      error: (message, metadata) => this.error(message, metadata),
      warn: (message, metadata) => this.warn(message, metadata),
      info: (message, metadata) => this.info(message, metadata),
      debug: (message, metadata) => this.debug(message, metadata)
    };
  }

  // Get stored logs (for analytics/debugging)
  getLogs() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
    } else {
      return global.affordmedLogs || [];
    }
  }

  // Clear stored logs
  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('affordmed_logs');
    } else {
      global.affordmedLogs = [];
    }
  }
}

// Factory function to create logger instances
function createLogger(options = {}) {
  return new AffordmedLogger(options);
}

// Default logger instance
const defaultLogger = createLogger({
  serviceName: 'AFFORDMED-DEFAULT',
  environment: process.env.NODE_ENV || 'development'
});

module.exports = {
  AffordmedLogger,
  createLogger,
  logger: defaultLogger
};