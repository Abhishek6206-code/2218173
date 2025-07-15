import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar, 
  Typography,
  Container,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import UrlShortener from './components/UrlShortener';
import UrlStatistics from './components/UrlStatistics';
import { useLogger } from './utils/logger';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const logger = useLogger();

  const getCurrentTab = () => {
    if (location.pathname === '/statistics') {
      return 1;
    }
    return 0;
  };

  const handleTabChange = (event, newValue) => {
    const routes = ['/', '/statistics'];
    const targetRoute = routes[newValue];
    
    logger.info('User navigating to new page', { 
      from: location.pathname,
      to: targetRoute
    });
    
    navigate(targetRoute);
  };

  React.useEffect(() => {
    logger.info('Page view', { 
      page: location.pathname
    });
  }, [location.pathname, logger]);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AFFORDMED® URL Shortener
          </Typography>
          <Typography variant="body2">
            Technology, Innovation & Affordability
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Tabs 
          value={getCurrentTab()} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="URL Shortener" 
            component={RouterLink} 
            to="/"
          />
          <Tab 
            label="URL Statistics" 
            component={RouterLink} 
            to="/statistics"
          />
        </Tabs>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/statistics" element={<UrlStatistics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
