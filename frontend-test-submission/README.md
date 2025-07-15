# AFFORDMED® URL Shortener Frontend

React frontend application for the URL Shortener microservice with Material UI design.

## Features

- ✅ **Bulk URL Shortening**: Create up to 5 URLs at once
- ✅ **Material UI Design**: Clean, modern interface
- ✅ **Client-side Validation**: Real-time form validation
- ✅ **Statistics Dashboard**: Comprehensive analytics view
- ✅ **Click Analytics**: Detailed click tracking with timestamps
- ✅ **Custom Logging**: Integration with AFFORDMED logging middleware
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Copy to Clipboard**: Easy sharing of shortened URLs

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

The application will run on http://localhost:3000

## Application Structure

### Pages

#### 1. URL Shortener Page (`/`)
- Create up to 5 shortened URLs simultaneously
- **Input Fields per URL:**
  - Original URL (required)
  - Validity period in minutes (default: 30)
  - Custom shortcode (optional, 3-10 alphanumeric)
- **Client-side Validation:**
  - Valid HTTP/HTTPS URL format
  - Positive integer validity
  - Alphanumeric shortcode validation
  - Duplicate URL/shortcode detection
- **Results Display:**
  - Generated short URL with copy functionality
  - Expiry date and time
  - Success/error status per URL

#### 2. URL Statistics Page (`/statistics`)
- **URL List Display:**
  - All created short URLs
  - Click counts with visual indicators
  - Creation and expiry timestamps
  - Active/Expired status badges
- **Detailed Analytics:**
  - Expandable click data table
  - Timestamp, referrer, and location tracking
  - Relative time formatting
  - Real-time refresh capability

### Components

#### Navigation
- **Header**: AFFORDMED branding with tagline
- **Tab Navigation**: Switch between Shortener and Statistics
- **Footer**: Company information and credits

#### Forms & Validation
- **Dynamic URL Inputs**: Add/remove URL fields (max 5)
- **Real-time Validation**: Instant feedback on input errors
- **Bulk Processing**: Parallel URL creation with individual results

#### Data Display
- **Statistics Cards**: Clean display of URL information
- **Analytics Tables**: Sortable click data with detailed information
- **Status Indicators**: Visual chips for clicks and expiry status

## Client-side Validation Rules

### URL Validation
```javascript
// Must be valid HTTP or HTTPS URL
const isValid = /^https?:\/\/.+/.test(url);
```

### Validity Period
```javascript
// Must be positive integer (minutes)
const isValid = Number.isInteger(validity) && validity > 0;
```

### Custom Shortcode
```javascript
// 3-10 alphanumeric characters only
const isValid = /^[a-zA-Z0-9]{3,10}$/.test(shortcode);
```

### Duplicate Prevention
- Prevents duplicate URLs in the same submission
- Prevents duplicate custom shortcodes
- Real-time validation feedback

## API Integration

### Backend Communication
```javascript
// API base URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Axios interceptors for logging
// Automatic error handling
// Request/response logging integration
```

### Error Handling
- Network error recovery
- API error message display
- Graceful degradation for offline scenarios
- User-friendly error messages

## Material UI Components Used

### Layout & Navigation
- `AppBar`, `Toolbar` - Header navigation
- `Tabs`, `Tab` - Page navigation
- `Container`, `Grid` - Responsive layout
- `Box`, `Stack` - Flexible containers

### Forms & Inputs
- `TextField` - URL, validity, shortcode inputs
- `Button` - Action buttons with loading states
- `IconButton` - Secondary actions
- `Tooltip` - Help text and guidance

### Data Display
- `Card`, `CardContent` - Content containers
- `Table`, `TableRow`, `TableCell` - Analytics tables
- `Chip` - Status indicators
- `Typography` - Text hierarchy

### Feedback & States
- `Alert` - Error and success messages
- `CircularProgress` - Loading indicators
- `Collapse` - Expandable sections
- `Paper` - Elevated surfaces

## Logging Integration

### Frontend Logging
```javascript
import { useLogger } from '../utils/logger';

// Component usage
const logger = useLogger();
logger.info('User action performed', { action: 'url_created' });
```

### Log Categories
- **User Actions**: Form submissions, navigation
- **API Requests**: All backend communication
- **Errors**: Client-side and API errors
- **Performance**: Component render times

### Log Storage
- **Development**: Console output + localStorage
- **Production**: localStorage (configurable for external service)

## Styling Guidelines

### Material UI Theme
```javascript
// Custom theme configuration
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});
```

### Design Principles
- **Consistent Spacing**: 8px grid system
- **Color Hierarchy**: Primary/secondary color usage
- **Typography Scale**: Consistent heading and body text
- **Interactive Feedback**: Hover states and loading indicators

## Performance Optimizations

### React Optimizations
- Functional components with hooks
- Proper dependency arrays in useEffect
- Memoization for expensive calculations
- Lazy loading for future features

### Network Optimizations
- Axios request/response interceptors
- Efficient API call patterns
- Local state management
- Debounced form validation

## Environment Configuration

### Environment Variables
```bash
REACT_APP_API_URL=http://localhost:3001  # Backend API URL
NODE_ENV=development                     # Environment mode
```

### Build Configuration
- Development: Hot reload enabled
- Production: Optimized bundle with code splitting
- Proxy: Backend API proxied in development

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS Safari, Chrome Mobile
- **Features**: ES6+, Fetch API, LocalStorage, Clipboard API

## Development Workflow

### Local Development
1. Start backend server (port 3001)
2. Start frontend development server (port 3000)
3. Use browser developer tools for debugging
4. Check console for logging output

### Code Structure
```
src/
├── components/         # React components
│   ├── UrlShortener.js # URL creation page
│   └── UrlStatistics.js # Analytics page
├── utils/             # Utilities
│   ├── api.js         # API communication
│   └── logger.js      # Logging integration
├── App.js             # Main app component
└── index.js           # App entry point
```

### Adding New Features
1. Follow Material UI design patterns
2. Use custom logging for all user actions
3. Implement proper error handling
4. Add client-side validation where appropriate

---

**AFFORDMED® - Technology, Innovation & Affordability**