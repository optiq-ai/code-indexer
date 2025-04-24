import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Grid, Divider, List, Chip, Card,
  CardContent, CardActions, Collapse,
  Tooltip, IconButton
} from '@mui/material';
import { 
  Search, Code, ContentCopy, Add, ExpandMore, ExpandLess,
  TextFields, FormatColorText
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';

const CodeSearch = ({ 
  setLoading, 
  handleNotification, 
  searchResults, 
  setSearchResults,
  selectedChunks,
  handleSelectChunk
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [limit, setLimit] = useState(10);
  const [expandedChunk, setExpandedChunk] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const codeRefs = useRef({});

  const supportedLanguages = [
    'python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'sql', 
    'html', 'css', 'bash', 'powershell', 'yaml', 'json', 'xml'
  ];

  // Efekt do obsługi zaznaczania tekstu
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.toString()) {
        setSelectedText(selection.toString());
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, []);

  const handleSearch = async () => {
    if (!query) {
      handleNotification(t('pleaseEnterSearchQuery'), 'error');
      return;
    }

    setLoading(true);
    try {
      let url = `http://localhost:8000/search/?query=${encodeURIComponent(query)}&limit=${limit}`;
      if (language) {
        url += `&language=${encodeURIComponent(language)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data);
        handleNotification(t('foundResults', { count: data.length }), 'success');
      } else {
        handleNotification(`${t('error')}: ${data.detail || t('failedToSearchCode')}`, 'error');
      }
    } catch (error) {
      handleNotification(`${t('error')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    handleNotification(t('codeCopiedToClipboard'), 'success');
  };

  const handleCopySelectedText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      handleNotification(t('selectedTextCopied'), 'success');
    } else {
      handleNotification(t('noTextSelected'), 'warning');
    }
  };

  const handleExpandChunk = (id) => {
    setExpandedChunk(expandedChunk === id ? null : id);
  };

  const isChunkSelected = (id) => {
    return selectedChunks.some(chunk => chunk.id === id);
  };

  // Funkcja do renderowania kodu z możliwością zaznaczania
  const renderSelectableCode = (code, language, chunkId) => {
    return (
      <Box 
        sx={{ 
          position: 'relative',
          '& pre': {
            cursor: 'text',
            userSelect: 'text'
          }
        }}
        ref={el => codeRefs.current[chunkId] = el}
      >
        <SyntaxHighlighter 
          language={language} 
          style={docco}
          customStyle={{ 
            maxHeight: '300px', 
            overflow: 'auto',
            position: 'relative',
            zIndex: 1
          }}
          wrapLines={true}
          showLineNumbers={true}
        >
          {code}
        </SyntaxHighlighter>
        
        {selectedText && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: '8px', 
            right: '8px', 
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '4px',
            padding: '4px'
          }}>
            <Tooltip title={t('copySelectedText')}>
              <IconButton 
                size="small" 
                onClick={handleCopySelectedText}
                color="primary"
              >
                <TextFields fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('searchCode')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            label={t('searchQuery')}
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            margin="normal"
            placeholder={t('enterSearchQuery')}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('languageOptional')}</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label={t('languageOptional')}
            >
              <MenuItem value="">
                <em>{t('allLanguages')}</em>
              </MenuItem>
              {supportedLanguages.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSearch}
          startIcon={<Search />}
          disabled={!query}
        >
          {t('search')}
        </Button>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t('resultsLimit')}</InputLabel>
          <Select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            label={t('resultsLimit')}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {searchResults.length > 0 ? (
        <List>
          {searchResults.map((chunk) => (
            <Card key={chunk.id} sx={{ mb: 2, border: isChunkSelected(chunk.id) ? '2px solid #3f51b5' : 'none' }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {chunk.name}
                  </Typography>
                  <Box>
                    <Chip 
                      label={chunk.language} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                    />
                    {chunk.incomplete && (
                      <Chip 
                        label={t('incomplete')} 
                        size="small" 
                        color="warning" 
                      />
                    )}
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {chunk.description}
                </Typography>
                
                <Collapse in={expandedChunk === chunk.id} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    {renderSelectableCode(chunk.raw, chunk.language, chunk.id)}
                  </Box>
                </Collapse>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={expandedChunk === chunk.id ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => handleExpandChunk(chunk.id)}
                >
                  {expandedChunk === chunk.id ? t('hideCode') : t('showCode')}
                </Button>
                
                <Button 
                  size="small" 
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopyCode(chunk.raw)}
                >
                  {t('copy')}
                </Button>
                
                <Button 
                  size="small" 
                  startIcon={isChunkSelected(chunk.id) ? null : <Add />}
                  color={isChunkSelected(chunk.id) ? "error" : "primary"}
                  onClick={() => handleSelectChunk(chunk)}
                >
                  {isChunkSelected(chunk.id) ? t('deselect') : t('select')}
                </Button>
              </CardActions>
            </Card>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Code sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {t('noSearchResultsYet')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CodeSearch;
