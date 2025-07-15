# AFFORDMED URL Shortener

A simple URL shortener microservice built with React and Node.js.

## Features

- Shorten up to 5 URLs at once
- Custom shortcodes (optional)
- URL expiration (default: 30 minutes)
- Click tracking and analytics
- Material UI interface

## Setup

### Backend
```bash
cd backend-test-submission
npm install
npm start
```

### Frontend
```bash
cd frontend-test-submission
npm install
npm start
```

### Logging Middleware
```bash
cd logging-middleware
npm install
```

## API Endpoints

- `POST /shorturls` - Create short URL
- `GET /shorturls/:code` - Get URL statistics
- `GET /:code` - Redirect to original URL
- `GET /api/urls` - Get all URLs

## Usage

1. Open http://localhost:3000
2. Enter URLs to shorten
3. View statistics on the Statistics tab
4. Use short URLs to redirect to original URLs

## Requirements

- Node.js 16+
- React 18+
- Material UI 5+