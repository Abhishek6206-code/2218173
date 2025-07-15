// Custom logger class for AFFORDMED - built this to replace console.log everywhere
class AffordmedLogger {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'AFFORDMED-SERVICE';
    this.environment = options.environment || 'development';
    this.logLevel = options.logLevel || 'info';
    this.enableTimestamp = options.enableTimestamp !== false;
    
    // TODO: maybe add colors for different log levels later
    this.levels = {
      error: 0,
      warn: 1, 
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
    
    // Initialize logs array if it doesn't exist
    if (typeof window === 'undefined' && !global.affordmedLogs) {
      global.affordmedLogs = [];
    }
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
    // TODO: In production we should send this to ELK stack or something
    try {
      if (typeof window !== 'undefined') {
        // Browser environment - use localStorage
        let logs = [];
        try {
          logs = JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
        } catch (e) {
          // sometimes localStorage gets corrupted, just reset it
          logs = [];
        }
        logs.push(logEntry);
        // keep only recent logs so we don't fill up storage
        if (logs.length > 1000) {
          logs.shift();
        }
        localStorage.setItem('affordmed_logs', JSON.stringify(logs));
      } else {
        // Node.js environment
        if (!global.affordmedLogs) global.affordmedLogs = [];
        global.affordmedLogs.push(logEntry);
        if (global.affordmedLogs.length > 1000) {
          global.affordmedLogs.shift(); // remove oldest
        }
      }
    } catch (err) {
      // fallback to console if storage fails
      if (this.environment === 'development') {
        console.warn('Failed to store log:', err);
      }
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

  // Express middleware - logs all requests automatically
  expressMiddleware() {
    const self = this; // capture this context
    return (req, res, next) => {
      const startTime = Date.now();
      
      // log the incoming request
      self.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
      });

      // monkey patch res.end to capture response timing
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        // NOTE: creating new logger instance here feels weird but it works
        const responseLogger = new AffordmedLogger({ 
          serviceName: self.serviceName + '-RESPONSE' 
        });
        responseLogger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: duration + 'ms',
          success: res.statusCode < 400
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