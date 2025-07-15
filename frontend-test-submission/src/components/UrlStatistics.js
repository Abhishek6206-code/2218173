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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Button,
  Divider,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Mouse as MouseIcon,
  Link as LinkIcon
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

  // Fetch all URLs
  const fetchUrls = async () => {
    try {
      logger.info('Fetching URL statistics');
      setLoading(true);
      setError('');
      
      const data = await urlAPI.getAllUrls();
      setUrls(data);
      
      logger.info('URL statistics loaded', { count: data.length });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch URLs';
      setError(errorMessage);
      logger.error('Failed to fetch URL statistics', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed analytics for a specific URL
  const fetchUrlDetails = async (shortCode) => {
    try {
      setDetailsLoading(prev => ({ ...prev, [shortCode]: true }));
      logger.info('Fetching detailed analytics', { shortCode });
      
      const details = await urlAPI.getUrlStats(shortCode);
      
      // Update the URL in the list with detailed analytics
      setUrls(prev => prev.map(url => 
        url.shortCode === shortCode 
          ? { ...url, ...details }
          : url
      ));
      
      logger.info('Detailed analytics loaded', { 
        shortCode, 
        clicks: details.clicks,
        clickDataCount: details.clickData?.length || 0
      });
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch URL details';
      logger.error('Failed to fetch URL details', { shortCode, error: errorMessage });
    } finally {
      setDetailsLoading(prev => ({ ...prev, [shortCode]: false }));
    }
  };

  // Toggle expanded view for URL details
  const toggleExpanded = async (shortCode) => {
    if (expandedUrl === shortCode) {
      setExpandedUrl(null);
      logger.info('Analytics panel collapsed', { shortCode });
    } else {
      setExpandedUrl(shortCode);
      logger.info('Analytics panel expanded', { shortCode });
      
      // Fetch detailed analytics if not already loaded
      const url = urls.find(u => u.shortCode === shortCode);
      if (!url.clickData) {
        await fetchUrlDetails(shortCode);
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard', { url: text });
    } catch (error) {
      logger.warn('Failed to copy to clipboard', { error: error.message });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Check if URL is expired
  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading URL Statistics...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
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

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View analytics and statistics for all your shortened URLs including click counts, 
        creation dates, expiry times, and detailed click data with timestamps and referrers.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <AnalyticsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
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
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  {/* Main URL Info */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          /{url.shortCode}
                        </Typography>
                        
                        <Chip
                          size="small"
                          icon={<MouseIcon />}
                          label={`${url.clicks} clicks`}
                          color={url.clicks > 0 ? 'primary' : 'default'}
                        />
                        
                        <Chip
                          size="small"
                          icon={<ScheduleIcon />}
                          label={isExpired(url.expiry) ? 'Expired' : 'Active'}
                          color={isExpired(url.expiry) ? 'error' : 'success'}
                        />
                      </Box>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          backgroundColor: 'grey.100',
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        <strong>Original:</strong> {url.originalUrl}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          mb: 2,
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          p: 1,
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => copyToClipboard(url.shortLink)}
                        title="Click to copy"
                      >
                        <strong>Short:</strong> {url.shortLink}
                      </Typography>

                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(url.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires: {formatDate(url.expiry)}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Tooltip title="Open short URL">
                        <IconButton 
                          color="primary"
                          onClick={() => window.open(url.shortLink, '_blank')}
                        >
                          <LaunchIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={expandedUrl === url.shortCode ? 'Hide details' : 'Show details'}>
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
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Detailed Analytics */}
                  <Collapse in={expandedUrl === url.shortCode}>
                    <Divider sx={{ my: 2 }} />
                    
                    {url.clickData ? (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Click Analytics
                        </Typography>
                        
                        {url.clickData.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No clicks recorded yet.
                          </Typography>
                        ) : (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Timestamp</strong></TableCell>
                                  <TableCell><strong>Referrer</strong></TableCell>
                                  <TableCell><strong>Location</strong></TableCell>
                                  <TableCell><strong>Relative Time</strong></TableCell>
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
                                    <TableCell>
                                      {formatRelativeTime(click.timestamp)}
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
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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