import React, { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Grid, Divider, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Chip, Card,
  CardContent, CardActions, Collapse
} from '@mui/material';
import { Search, Code, ContentCopy, Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeSearch = ({ 
  setLoading, 
  handleNotification, 
  searchResults, 
  setSearchResults,
  selectedChunks,
  handleSelectChunk
}) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [limit, setLimit] = useState(10);
  const [expandedChunk, setExpandedChunk] = useState(null);

  const supportedLanguages = [
    'python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'sql', 
    'html', 'css', 'bash', 'powershell', 'yaml', 'json', 'xml'
  ];

  const handleSearch = async () => {
    if (!query) {
      handleNotification('Please enter a search query', 'error');
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
        handleNotification(`Found ${data.length} results`, 'success');
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to search code'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    handleNotification('Code copied to clipboard', 'success');
  };

  const handleExpandChunk = (id) => {
    setExpandedChunk(expandedChunk === id ? null : id);
  };

  const isChunkSelected = (id) => {
    return selectedChunks.some(chunk => chunk.id === id);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Code
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Search Query"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            margin="normal"
            placeholder="Enter semantic search query..."
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Language (Optional)</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label="Language (Optional)"
            >
              <MenuItem value="">
                <em>All Languages</em>
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
          Search
        </Button>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Results Limit</InputLabel>
          <Select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            label="Results Limit"
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
                        label="Incomplete" 
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
                    <SyntaxHighlighter 
                      language={chunk.language} 
                      style={docco}
                      customStyle={{ maxHeight: '300px', overflow: 'auto' }}
                    >
                      {chunk.raw}
                    </SyntaxHighlighter>
                  </Box>
                </Collapse>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={expandedChunk === chunk.id ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => handleExpandChunk(chunk.id)}
                >
                  {expandedChunk === chunk.id ? 'Hide Code' : 'Show Code'}
                </Button>
                
                <Button 
                  size="small" 
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopyCode(chunk.raw)}
                >
                  Copy
                </Button>
                
                <Button 
                  size="small" 
                  startIcon={isChunkSelected(chunk.id) ? null : <Add />}
                  color={isChunkSelected(chunk.id) ? "error" : "primary"}
                  onClick={() => handleSelectChunk(chunk)}
                >
                  {isChunkSelected(chunk.id) ? 'Deselect' : 'Select'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Code sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No search results yet. Try searching for code snippets.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CodeSearch;
