class AffordmedLogger {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'AFFORDMED-SERVICE';
    this.environment = options.environment || 'development';
    this.logLevel = options.logLevel || 'info';
    this.enableTimestamp = options.enableTimestamp !== false;

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.currentLevel = this.levels[this.logLevel] || this.levels.info;

    if (typeof window === 'undefined' && !global.affordmedLogs) {
      global.affordmedLogs = [];
    }
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
    const service = `[${this.serviceName}]`;
    const logLevel = `[${level.toUpperCase()}]`;

    const logEntry = {
      timestamp,
      service: this.serviceName,
      level: level.toUpperCase(),
      message,
      environment: this.environment,
      ...metadata
    };

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

    this.storeLog(formatted.structured);

    if (this.environment === 'development') {
      const consoleMethod =
        level === 'error' ? 'error' :
        level === 'warn'  ? 'warn'  : 'log';
      console[consoleMethod](formatted.display);
    }

    return formatted.structured;
  }

  storeLog(logEntry) {
    try {
      if (typeof window !== 'undefined') {
        let logs = [];
        try {
          logs = JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
        } catch {
          logs = [];
        }
        logs.push(logEntry);
        if (logs.length > 1000) logs.shift();
        localStorage.setItem('affordmed_logs', JSON.stringify(logs));
      } else {
        if (!global.affordmedLogs) global.affordmedLogs = [];
        global.affordmedLogs.push(logEntry);
        if (global.affordmedLogs.length > 1000) global.affordmedLogs.shift();
      }
    } catch (err) {
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

  expressMiddleware() {
    const self = this;
    return (req, res, next) => {
      const startTime = Date.now();

      self.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
      });

      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;

        const responseLogger = new AffordmedLogger({
          serviceName: `${self.serviceName}-RESPONSE`
        });
        responseLogger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          success: res.statusCode < 400
        });

        originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  useLogger() {
    if (typeof window === 'undefined') {
      throw new Error('useLogger can only be used in client-side React components');
    }

    return {
      error: (message, metadata) => this.error(message, metadata),
      warn:  (message, metadata) => this.warn(message, metadata),
      info:  (message, metadata) => this.info(message, metadata),
      debug: (message, metadata) => this.debug(message, metadata)
    };
  }

  getLogs() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
    }
    return global.affordmedLogs || [];
  }

  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('affordmed_logs');
    } else {
      global.affordmedLogs = [];
    }
  }
}

function createLogger(options = {}) {
  return new AffordmedLogger(options);
}

const defaultLogger = createLogger({
  serviceName: 'AFFORDMED-DEFAULT',
  environment: process.env.NODE_ENV || 'development'
});

module.exports = {
  AffordmedLogger,
  createLogger,
  logger: defaultLogger
};
