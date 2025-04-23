import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, AppBar, Toolbar, 
  Tab, Tabs, Paper, CircularProgress, Snackbar, Alert
} from '@mui/material';
import CodeIngestion from './components/CodeIngestion';
import CodeSearch from './components/CodeSearch';
import ChunkManipulation from './components/ChunkManipulation';
import TemplateManagement from './components/TemplateManagement';

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChunks, setSelectedChunks] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSelectChunk = (chunk) => {
    if (selectedChunks.some(c => c.id === chunk.id)) {
      setSelectedChunks(selectedChunks.filter(c => c.id !== chunk.id));
    } else {
      setSelectedChunks([...selectedChunks, chunk]);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Code Indexer
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Intelligent Code Library
          </Typography>
          <Typography variant="body1" paragraph>
            Store, index, describe, and semantically search code fragments. 
            Split, merge, and create intelligent, configurable templates.
            Generate new code fragments or complete unfinished ones using LLM.
          </Typography>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="code indexer tabs">
            <Tab label="Ingest Code" />
            <Tab label="Search Code" />
            <Tab label="Manipulate Chunks" />
            <Tab label="Templates" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <CodeIngestion 
            setLoading={setLoading} 
            handleNotification={handleNotification} 
          />
        )}
        
        {tabValue === 1 && (
          <CodeSearch 
            setLoading={setLoading} 
            handleNotification={handleNotification}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            selectedChunks={selectedChunks}
            handleSelectChunk={handleSelectChunk}
          />
        )}
        
        {tabValue === 2 && (
          <ChunkManipulation 
            setLoading={setLoading} 
            handleNotification={handleNotification}
            selectedChunks={selectedChunks}
            setSelectedChunks={setSelectedChunks}
          />
        )}
        
        {tabValue === 3 && (
          <TemplateManagement 
            setLoading={setLoading} 
            handleNotification={handleNotification}
            selectedChunks={selectedChunks}
          />
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;
