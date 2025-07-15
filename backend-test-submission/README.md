# AFFORDMED® URL Shortener Backend

Node.js/Express API backend for the URL Shortener microservice.

## Features

- ✅ RESTful API for URL shortening
- ✅ Custom shortcode support
- ✅ Automatic expiry handling
- ✅ Click analytics and tracking
- ✅ CORS enabled for frontend
- ✅ Custom logging middleware integration
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev    # Uses nodemon for auto-restart
```

### Production
```bash
npm start      # Standard node server
```

The server will start on http://localhost:3001

## API Endpoints

### 1. Create Short URL
**POST** `/shorturls`

**Request Body:**
```json
{
  "url": "https://very-long-url.com/page",
  "validity": 30,
  "shortcode": "abcd1"
}
```

**Response (201):**
```json
{
  "shortLink": "http://localhost:3001/abcd1",
  "expiry": "2025-01-01T00:30:00Z"
}
```

### 2. Get URL Statistics
**GET** `/shorturls/:shortcode`

**Response (200):**
```json
{
  "clicks": 5,
  "originalUrl": "https://very-long-url.com/page",
  "createdAt": "2025-01-01T00:00:00Z",
  "expiry": "2025-01-01T00:30:00Z",
  "clickData": [
    {
      "timestamp": "2025-01-01T00:15:00Z",
      "referrer": "https://google.com",
      "location": "Unknown"
    }
  ]
}
```

### 3. Redirect Short URL
**GET** `/:shortcode`

**Response:** HTTP 302 redirect to original URL

### 4. Get All URLs
**GET** `/api/urls`

**Response (200):**
```json
[
  {
    "shortCode": "abcd1",
    "originalUrl": "https://very-long-url.com/page",
    "shortLink": "http://localhost:3001/abcd1",
    "createdAt": "2025-01-01T00:00:00Z",
    "expiry": "2025-01-01T00:30:00Z",
    "clicks": 5
  }
]
```

### 5. Health Check
**GET** `/health`

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "uptime": 3600,
  "totalUrls": 10
}
```

## Validation Rules

### URL Validation
- Must be a valid HTTP or HTTPS URL
- Required field for creating short URLs

### Validity Period
- Must be a positive integer (minutes)
- Default: 30 minutes if not provided
- Minimum: 1 minute

### Custom Shortcode
- Optional field
- 3-10 alphanumeric characters only
- Must be globally unique
- Case-sensitive

## Error Responses

All errors return JSON with descriptive messages:

```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `404` - Short URL not found
- `409` - Shortcode already exists
- `410` - Short URL expired
- `500` - Internal server error

## Data Storage

Currently uses in-memory storage for demonstration. For production:

- Replace `Map` objects with persistent database
- Implement proper data persistence
- Add data backup and recovery
- Consider database indexing for performance

## Logging

Uses custom AFFORDMED logging middleware:

- All requests/responses logged
- Structured log format with timestamps
- Different log levels (error, warn, info, debug)
- Logs stored in memory for demo (in production, use external service)

## Security Features

- Helmet.js for security headers
- CORS configured for frontend origin
- Input validation and sanitization
- Rate limiting ready (not implemented in demo)

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **uuid**: Unique identifier generation
- **node-cron**: Scheduled cleanup tasks

## Environment Variables

```bash
PORT=3001                    # Server port (default: 3001)
NODE_ENV=development         # Environment (development/production)
```

## Development

### Code Structure
```
server.js              # Main server file
../logging-middleware/ # Custom logging middleware
```

### Adding New Features
1. Add new routes in `server.js`
2. Use logging middleware for all actions
3. Follow existing error handling patterns
4. Add appropriate validation

### Testing the API
Use tools like Postman, curl, or the provided React frontend to test the API endpoints.

Example curl commands:

```bash
# Create short URL
curl -X POST http://localhost:3001/shorturls \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","validity":60}'

# Get statistics
curl http://localhost:3001/shorturls/abc123

# Test redirect
curl -L http://localhost:3001/abc123
```

---

**AFFORDMED® - Technology, Innovation & Affordability**