import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { urlAPI, validateUrl, validateShortCode, validateValidity } from '../utils/api';
import { useLogger } from '../utils/logger';

function UrlShortener() {
  const logger = useLogger();
  const [urls, setUrls] = useState([
    { id: 1, url: '', validity: 30, shortcode: '', error: '', result: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const addUrlInput = () => {
    if (urls.length >= 5) {
      console.log('Already at max URLs');
      return;
    }
    
    const newId = Math.max(...urls.map(u => u.id)) + 1;
    const newUrl = { 
      id: newId, 
      url: '', 
      validity: 30, 
      shortcode: '', 
      error: '', 
      result: null 
    };
    setUrls([...urls, newUrl]);
    
    logger.info('Added new URL input', { totalInputs: urls.length + 1 });
  };

  const removeUrlInput = (id) => {
    if (urls.length <= 1) {
      console.log('Cannot remove last URL input');
      return;
    }
    
    const filtered = urls.filter(u => u.id !== id);
    setUrls(filtered);
    logger.info('Removed URL input', { removedId: id, remaining: filtered.length });
  };

  const updateUrl = (id, field, value) => {
    const updated = urls.map(u => {
      if (u.id === id) {
        return { ...u, [field]: value, error: '', result: null };
      }
      return u;
    });
    setUrls(updated);
  };

  const validateUrlEntry = (entry) => {
    if (!entry.url || !entry.url.trim()) {
      return 'URL is required';
    }
    
    if (!validateUrl(entry.url)) {
      return 'Please enter a valid HTTP or HTTPS URL';
    }
    
    if (entry.validity && !validateValidity(entry.validity)) {
      return 'Validity must be a positive integer (minutes)';
    }
    
    if (entry.shortcode && entry.shortcode.trim() && !validateShortCode(entry.shortcode)) {
      return 'Shortcode must be 3-10 alphanumeric characters';
    }
    
    return null;
  };

  const validateAllUrls = () => {
    const validUrls = urls.filter(u => u.url.trim());
    
    if (validUrls.length === 0) {
      return 'Please enter at least one URL to shorten';
    }

    const urlMap = new Map();
    for (const entry of validUrls) {
      if (urlMap.has(entry.url)) {
        return 'Duplicate URLs are not allowed';
      }
      urlMap.set(entry.url, true);
    }

    const shortcodes = validUrls
      .filter(u => u.shortcode && u.shortcode.trim())
      .map(u => u.shortcode.trim());
    
    if (shortcodes.length !== new Set(shortcodes).size) {
      return 'Duplicate shortcodes are not allowed';
    }

    for (const entry of validUrls) {
      const error = validateUrlEntry(entry);
      if (error) {
        return error;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    console.log('Starting URL shortening process...');
    logger.info('Form submitted', { urlCount: urls.length });
    
    setGlobalError('');
    const clearedUrls = urls.map(u => ({ ...u, error: '', result: null }));
    setUrls(clearedUrls);

    const validationError = validateAllUrls();
    if (validationError) {
      setGlobalError(validationError);
      logger.warn('Validation failed', { error: validationError });
      return;
    }

    setLoading(true);

    try {
      const validUrls = urls.filter(u => u.url && u.url.trim());
      console.log(`Processing ${validUrls.length} URLs...`);
      
      const apiPromises = validUrls.map(async (entry) => {
        try {
          const requestData = {
            url: entry.url.trim(),
            validity: parseInt(entry.validity) || 30
          };
          
          if (entry.shortcode && entry.shortcode.trim()) {
            requestData.shortcode = entry.shortcode.trim();
          }

          const result = await urlAPI.createShortUrl(requestData);
          return { id: entry.id, success: true, result: result };
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          logger.error('API call failed', {
            url: entry.url,
            error: errorMsg
          });
          return { 
            id: entry.id, 
            success: false, 
            error: errorMsg || 'Failed to shorten URL' 
          };
        }
      });

      const results = await Promise.all(apiPromises);
      
      const updatedUrls = urls.map(u => {
        const apiResult = results.find(r => r.id === u.id);
        if (apiResult) {
          if (apiResult.success) {
            return { ...u, result: apiResult.result, error: '' };
          } else {
            return { ...u, error: apiResult.error, result: null };
          }
        }
        return u;
      });
      setUrls(updatedUrls);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      console.log(`Completed: ${successCount} success, ${failCount} failed`);

      logger.info('Batch URL processing complete', { 
        successful: successCount, 
        failed: failCount,
        total: results.length
      });

    } catch (error) {
      setGlobalError('An unexpected error occurred. Please try again.');
      logger.error('Unexpected error during URL shortening', { 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('Short URL copied to clipboard', { shortUrl: text });
    } catch (error) {
      logger.warn('Failed to copy to clipboard', { error: error.message });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        URL Shortener
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Shorten up to 5 URLs at once. Enter the original URL, optionally set validity period (default: 30 minutes) 
        and custom shortcode, then click "Shorten URLs" to generate your shortened links.
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {globalError}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          {urls.map((entry, index) => (
            <Box key={entry.id}>
              {index > 0 && <Divider sx={{ my: 3 }} />}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  URL #{index + 1}
                </Typography>
                
                {urls.length > 1 && (
                  <Tooltip title="Remove this URL">
                    <IconButton 
                      onClick={() => removeUrlInput(entry.id)}
                      color="error"
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    value={entry.url}
                    onChange={(e) => updateUrl(entry.id, 'url', e.target.value)}
                    error={!!entry.error}
                    helperText={entry.error}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={entry.validity}
                    onChange={(e) => updateUrl(entry.id, 'validity', e.target.value)}
                    InputProps={{
                      startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'action.active' }} />,
                      inputProps: { min: 1 }
                    }}
                    helperText="Default: 30 minutes"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    placeholder="mycode123"
                    value={entry.shortcode}
                    onChange={(e) => updateUrl(entry.id, 'shortcode', e.target.value)}
                    InputProps={{
                      startAdornment: <CodeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    helperText="3-10 alphanumeric characters"
                  />
                </Grid>
              </Grid>

              {entry.result && (
                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ URL shortened successfully!
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Short URL:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => copyToClipboard(entry.result.shortLink)}
                      title="Click to copy"
                    >
                      {entry.result.shortLink}
                    </Typography>
                    <Tooltip title="Open in new tab">
                      <IconButton 
                        size="small" 
                        onClick={() => window.open(entry.result.shortLink, '_blank')}
                        sx={{ color: 'inherit' }}
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Typography variant="caption">
                    Expires: {new Date(entry.result.expiry).toLocaleString()}
                  </Typography>
                </Paper>
              )}
            </Box>
          ))}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
              sx={{ minWidth: 160 }}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>

            {urls.length < 5 && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addUrlInput}
                disabled={loading}
              >
                Add Another URL
              </Button>
            )}

            <Chip 
              label={`${urls.length}/5 URLs`} 
              color={urls.length === 5 ? 'warning' : 'default'} 
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UrlShortener;
