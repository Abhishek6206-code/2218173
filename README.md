# AFFORDMED® URL Shortener Microservice

**Technology, Innovation & Affordability**

A robust HTTP URL Shortener Microservice with React frontend, Node.js/Express backend, and custom logging middleware.

## Project Structure

```
├── logging-middleware/          # Custom logging middleware (shared)
├── frontend-test-submission/    # React frontend application
├── backend-test-submission/     # Node.js/Express API backend
└── README.md                   # This file
```

## Features

### Backend API
- ✅ Create shortened URLs with optional custom shortcodes
- ✅ Automatic expiry handling (default: 30 minutes)
- ✅ URL redirection with click analytics
- ✅ Comprehensive statistics and analytics
- ✅ Custom logging middleware integration
- ✅ Error handling with descriptive JSON responses
- ✅ CORS enabled for frontend integration

### Frontend React App
- ✅ Clean Material UI interface
- ✅ Bulk URL shortening (up to 5 URLs at once)
- ✅ Client-side validation
- ✅ Real-time statistics dashboard
- ✅ Click analytics with detailed reporting
- ✅ Custom logging integration
- ✅ Responsive design

### Custom Logging Middleware
- ✅ Structured logging with timestamps
- ✅ Multiple log levels (error, warn, info, debug)
- ✅ Cross-platform support (frontend & backend)
- ✅ Express middleware integration
- ✅ Local storage for frontend logs
- ✅ Memory storage for backend logs

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend-test-submission
npm install

# Install frontend dependencies
cd ../frontend-test-submission
npm install

# Install logging middleware dependencies
cd ../logging-middleware
npm install
```

### 2. Start the Backend Server

```bash
cd backend-test-submission
npm start
```

The backend will run on http://localhost:3001

### 3. Start the Frontend Application

```bash
cd frontend-test-submission
npm start
```

The frontend will run on http://localhost:3000

## API Endpoints

### Create Short URL
- **POST** `/shorturls`
- **Body**: `{ "url": "https://example.com", "validity": 30, "shortcode": "optional" }`
- **Response**: `{ "shortLink": "http://localhost:3001/abc123", "expiry": "2025-01-01T00:30:00Z" }`

### Get URL Statistics
- **GET** `/shorturls/:shortcode`
- **Response**: `{ "clicks": 5, "originalUrl": "...", "createdAt": "...", "expiry": "...", "clickData": [...] }`

### Redirect Short URL
- **GET** `/:shortcode`
- **Response**: HTTP 302 redirect to original URL

### Get All URLs
- **GET** `/api/urls`
- **Response**: Array of all active URLs with basic statistics

## Technology Stack

- **Frontend**: React 18, Material UI 5, React Router, Axios
- **Backend**: Node.js, Express, CORS, Helmet
- **Logging**: Custom middleware with structured logging
- **Validation**: Client & server-side validation
- **Storage**: In-memory (for demo purposes)

## Features Demonstration

1. **URL Shortening**: Create up to 5 short URLs at once
2. **Custom Shortcodes**: Use your own alphanumeric codes
3. **Expiry Management**: Set custom validity periods
4. **Click Analytics**: Track clicks with timestamps and referrers
5. **Real-time Statistics**: View comprehensive analytics
6. **Responsive Design**: Works on desktop and mobile
7. **Error Handling**: Comprehensive error messages
8. **Logging**: All actions logged with custom middleware

## Development

### Backend Development
```bash
cd backend-test-submission
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend-test-submission
npm start    # Hot reload enabled
```

## Production Considerations

For production deployment:

1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Caching**: Add Redis for improved performance
3. **Security**: Implement rate limiting and API authentication
4. **Logging**: Configure external logging service (ELK stack, etc.)
5. **Monitoring**: Add health checks and metrics
6. **Scaling**: Implement horizontal scaling with load balancer

## License

MIT License - AFFORDMED® 2025

---

**AFFORDMED® - Technology, Innovation & Affordability**