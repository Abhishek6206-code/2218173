# AFFORDMED® Logging Middleware

Custom logging middleware for both frontend and backend applications with structured logging, multiple log levels, and cross-platform support.

## Features

- ✅ **Structured Logging**: Consistent log format with timestamps and metadata
- ✅ **Multiple Log Levels**: Error, Warn, Info, Debug with hierarchy
- ✅ **Cross-Platform**: Works in both Node.js and browser environments
- ✅ **Express Integration**: Ready-to-use Express middleware
- ✅ **React Hook**: Easy integration with React components
- ✅ **Storage Options**: Memory (backend) and localStorage (frontend)
- ✅ **Environment Aware**: Different behavior for development/production
- ✅ **Service Identification**: Logs include service name for microservice environments

## Installation

```bash
npm install
```

## Usage

### Backend (Node.js/Express)

```javascript
const { createLogger } = require('./logging-middleware');

// Create logger instance
const logger = createLogger({
  serviceName: 'MY-BACKEND-SERVICE',
  environment: 'production',
  logLevel: 'info'
});

// Express middleware
app.use(logger.expressMiddleware());

// Manual logging
logger.info('Server started', { port: 3001 });
logger.error('Database connection failed', { error: err.message });
```

### Frontend (React)

```javascript
import { useLogger } from './utils/logger';

function MyComponent() {
  const logger = useLogger();
  
  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'submit' });
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

## Configuration Options

### Logger Constructor

```javascript
const logger = createLogger({
  serviceName: 'MY-SERVICE',      // Service identifier
  environment: 'development',     // Environment mode
  logLevel: 'info',              // Minimum log level
  enableTimestamp: true          // Include timestamps
});
```

### Log Levels (Hierarchy)

1. **error** (0) - Critical errors, exceptions
2. **warn** (1) - Warnings, non-critical issues  
3. **info** (2) - General information, user actions
4. **debug** (3) - Detailed debugging information

Only logs at or below the configured level will be output.

## API Reference

### Core Methods

```javascript
// Basic logging
logger.error(message, metadata);
logger.warn(message, metadata);
logger.info(message, metadata);
logger.debug(message, metadata);

// Generic log method
logger.log(level, message, metadata);
```

### Utility Methods

```javascript
// Get stored logs
const logs = logger.getLogs();

// Clear stored logs
logger.clearLogs();

// Check if level should be logged
const shouldLog = logger.shouldLog('debug');
```

### Express Middleware

```javascript
// Auto-logs all requests and responses
app.use(logger.expressMiddleware());

// Example log output:
// [INFO] Incoming request { method: 'POST', url: '/api/users' }
// [INFO] Request completed { method: 'POST', statusCode: 201, duration: '45ms' }
```

### React Hook

```javascript
const logger = useLogger();

// Returns object with logging methods
const { error, warn, info, debug, getLogs, clearLogs } = logger;
```

## Log Format

### Structured Log Entry

```javascript
{
  timestamp: "2025-01-01T12:00:00.000Z",
  service: "MY-SERVICE",
  level: "INFO",
  message: "User action performed",
  environment: "production",
  // Additional metadata...
  userId: "12345",
  action: "login"
}
```

### Backend Additional Fields

```javascript
{
  // ... base fields
  method: "POST",
  url: "/api/login",
  userAgent: "Mozilla/5.0...",
  ip: "192.168.1.1"
}
```

### Frontend Additional Fields

```javascript
{
  // ... base fields
  url: "http://localhost:3000/dashboard",
  userAgent: "Mozilla/5.0..."
}
```

## Storage Mechanisms

### Backend Storage (Node.js)

```javascript
// Stored in global.affordmedLogs array
// Automatic cleanup (keeps last 1000 entries)
// Access via logger.getLogs()
```

### Frontend Storage (Browser)

```javascript
// Stored in localStorage key: 'affordmed_logs'
// Automatic cleanup (keeps last 1000 entries)
// Fallback to memory if localStorage unavailable
```

## Environment Behavior

### Development Mode
- Console output enabled for debugging
- All log levels typically enabled
- Detailed error information

### Production Mode
- Console output disabled (backend)
- Structured logging only
- Optimized performance

## Express Middleware Features

### Request Logging
```javascript
// Automatically logs incoming requests
{
  level: "INFO",
  message: "Incoming request",
  method: "GET",
  url: "/api/users",
  userAgent: "Mozilla/5.0...",
  ip: "192.168.1.1"
}
```

### Response Logging
```javascript
// Automatically logs completed requests
{
  level: "INFO", 
  message: "Request completed",
  method: "GET",
  url: "/api/users",
  statusCode: 200,
  duration: "123ms"
}
```

## React Integration

### Component Usage

```javascript
import { useLogger } from '../utils/logger';

function UserForm() {
  const logger = useLogger();
  
  const handleSubmit = async (data) => {
    logger.info('Form submission started', { formType: 'user' });
    
    try {
      await submitUser(data);
      logger.info('Form submitted successfully', { userId: data.id });
    } catch (error) {
      logger.error('Form submission failed', { 
        error: error.message,
        formData: data 
      });
    }
  };
}
```

### Error Boundaries

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    const logger = createLogger({ serviceName: 'REACT-ERROR-BOUNDARY' });
    logger.error('React component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
}
```

## Performance Considerations

### Log Volume Management
- Automatic cleanup of old logs
- Configurable log level filtering
- Efficient JSON serialization

### Memory Usage
- Circular buffer for log storage
- Limited to 1000 entries per service
- Automatic garbage collection

### Network Impact (Frontend)
- localStorage writes are asynchronous
- No network calls in demo (configurable)
- Batch logging for high-frequency events

## Production Recommendations

### External Log Aggregation
```javascript
// Extend storeLog method for external services
storeLog(logEntry) {
  // ... existing storage logic
  
  // Send to external service
  if (this.environment === 'production') {
    sendToLogService(logEntry);
  }
}
```

### Security Considerations
- Filter sensitive data from logs
- Implement log retention policies
- Use structured logging for compliance

### Monitoring Integration
- ElasticSearch + Kibana for log analysis
- CloudWatch for AWS environments
- Custom dashboards for real-time monitoring

## Development & Testing

### Local Development
```javascript
// Enhanced logging for debugging
const logger = createLogger({
  serviceName: 'DEV-SERVICE',
  environment: 'development',
  logLevel: 'debug'
});
```

### Testing
```javascript
// Mock logger for unit tests
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};
```

## Migration Guide

### From Console Logging
```javascript
// Before
console.log('User logged in', userId);
console.error('Login failed', error);

// After
logger.info('User logged in', { userId });
logger.error('Login failed', { error: error.message });
```

### From Other Logging Libraries
```javascript
// Before (Winston example)
winston.log('info', 'Message', { metadata });

// After
logger.info('Message', { metadata });
```

---

**AFFORDMED® - Technology, Innovation & Affordability**