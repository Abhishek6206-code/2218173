import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Button,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { urlAPI } from '../utils/api';
import { useLogger } from '../utils/logger';

function UrlStatistics() {
  const logger = useLogger();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUrl, setExpandedUrl] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState({});

  const fetchUrls = async () => {
    try {
      logger.info('Fetching URL statistics');
      setLoading(true);
      setError('');
      
      const data = await urlAPI.getAllUrls();
      setUrls(data);
      
      logger.info('URL statistics loaded');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch URLs';
      setError(errorMessage);
      logger.error('Failed to fetch URL statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUrlDetails = async (shortCode) => {
    try {
      setDetailsLoading(prev => ({ ...prev, [shortCode]: true }));
      logger.info('Fetching detailed analytics');
      
      const details = await urlAPI.getUrlStats(shortCode);
      
      setUrls(prev => prev.map(url => 
        url.shortCode === shortCode 
          ? { ...url, ...details }
          : url
      ));
      
      logger.info('Detailed analytics loaded');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch URL details';
      logger.error('Failed to fetch URL details');
    } finally {
      setDetailsLoading(prev => ({ ...prev, [shortCode]: false }));
    }
  };

  const toggleExpanded = async (shortCode) => {
    if (expandedUrl === shortCode) {
      setExpandedUrl(null);
      logger.info('Analytics panel collapsed');
    } else {
      setExpandedUrl(shortCode);
      logger.info('Analytics panel expanded');
      
      const url = urls.find(u => u.shortCode === shortCode);
      if (!url.clickData) {
        await fetchUrlDetails(shortCode);
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard');
    } catch (error) {
      logger.warn('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchUrls}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No URLs Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by creating some shortened URLs to see their statistics here.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {urls.map((url) => (
            <Grid item xs={12} key={url.shortCode}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6">
                          /{url.shortCode}
                        </Typography>
                        
                        <Chip
                          size="small"
                          label={`${url.clicks} clicks`}
                          color={url.clicks > 0 ? 'primary' : 'default'}
                        />
                        
                        <Chip
                          size="small"
                          label={isExpired(url.expiry) ? 'Expired' : 'Active'}
                          color={isExpired(url.expiry) ? 'error' : 'success'}
                        />
                      </Box>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 2, wordBreak: 'break-all' }}
                      >
                        <strong>Original:</strong> {url.originalUrl}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          mb: 2,
                          wordBreak: 'break-all',
                          cursor: 'pointer'
                        }}
                        onClick={() => copyToClipboard(url.shortLink)}
                      >
                        <strong>Short:</strong> {url.shortLink}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(url.createdAt)} | 
                        Expires: {formatDate(url.expiry)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton 
                        color="primary"
                        onClick={() => window.open(url.shortLink, '_blank')}
                      >
                        <LaunchIcon />
                      </IconButton>
                      
                      <IconButton 
                        onClick={() => toggleExpanded(url.shortCode)}
                        disabled={detailsLoading[url.shortCode]}
                      >
                        {detailsLoading[url.shortCode] ? (
                          <CircularProgress size={24} />
                        ) : expandedUrl === url.shortCode ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expandedUrl === url.shortCode}>
                    <Divider sx={{ my: 2 }} />
                    
                    {url.clickData ? (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Click Analytics
                        </Typography>
                        
                        {url.clickData.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No clicks recorded yet.
                          </Typography>
                        ) : (
                          <TableContainer component={Paper}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Timestamp</TableCell>
                                  <TableCell>Referrer</TableCell>
                                  <TableCell>Location</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {url.clickData
                                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                  .map((click, index) => (
                                  <TableRow key={index}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>
                                      {formatDate(click.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                      {click.referrer || 'Direct'}
                                    </TableCell>
                                    <TableCell>
                                      {click.location || 'Unknown'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" color="text.secondary">
                          Loading detailed analytics...
                        </Typography>
                      </Box>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default UrlStatistics;
