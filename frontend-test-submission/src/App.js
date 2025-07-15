import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar, 
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import UrlShortener from './components/UrlShortener';
import UrlStatistics from './components/UrlStatistics';
import { useLogger } from './utils/logger';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const logger = useLogger();

  // figure out which tab should be active
  const getCurrentTab = () => {
    if (location.pathname === '/statistics') {
      return 1;
    }
    return 0; // default to first tab
  };

  const handleTabChange = (event, newValue) => {
    const routes = ['/', '/statistics'];
    const targetRoute = routes[newValue];
    
    // log navigation for analytics
    logger.info('User navigating to new page', { 
      from: location.pathname,
      to: targetRoute,
      tabIndex: newValue
    });
    
    navigate(targetRoute);
  };

  React.useEffect(() => {
    // track page views for analytics
    logger.info('Page view', { 
      page: location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, [location.pathname, logger]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Main header bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            AFFORDMED® URL Shortener
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic',
              opacity: 0.9
            }}
          >
            Technology, Innovation & Affordability
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Container maxWidth="lg">
          <Tabs 
            value={getCurrentTab()} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ 
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 500
              }
            }}
          >
            <Tab 
              label="URL Shortener" 
              component={RouterLink} 
              to="/"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              label="URL Statistics" 
              component={RouterLink} 
              to="/statistics"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/statistics" element={<UrlStatistics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 3,
          px: 2,
          backgroundColor: (theme) => theme.palette.grey[100],
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
            sx={{ fontWeight: 500 }}
          >
            © 2025 AFFORDMED®. All rights reserved.
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            align="center" 
            display="block"
            sx={{ mt: 0.5 }}
          >
            Powered by React & Node.js with Custom Logging Middleware
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;