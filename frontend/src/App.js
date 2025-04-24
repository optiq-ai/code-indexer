import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, AppBar, Toolbar, 
  Tab, Tabs, Paper, CircularProgress, Snackbar, Alert,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CodeIngestion from './components/CodeIngestion';
import CodeSearch from './components/CodeSearch';
import ChunkManipulation from './components/ChunkManipulation';
import TemplateManagement from './components/TemplateManagement';
import TaskStatusBar from './components/TaskStatusBar';
import LanguageSwitcher from './components/LanguageSwitcher';
import CodeAnalysis from './components/CodeAnalysis';
import ExportFeature from './components/ExportFeature';
import TagsAndCategories from './components/TagsAndCategories';
import EnhancedChunkManipulation from './components/EnhancedChunkManipulation';

function App() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [tasks, setTasks] = useState([]);

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
  
  // Add task to global task list
  const addTask = (taskId, status = 'pending', info = null) => {
    setTasks(prevTasks => {
      // Check if task already exists
      const existingTaskIndex = prevTasks.findIndex(task => task.id === taskId);
      
      if (existingTaskIndex >= 0) {
        // Update existing task
        const updatedTasks = [...prevTasks];
        updatedTasks[existingTaskIndex] = { 
          ...updatedTasks[existingTaskIndex],
          status,
          info,
          lastUpdated: new Date()
        };
        return updatedTasks;
      } else {
        // Add new task
        return [...prevTasks, { 
          id: taskId, 
          status, 
          info,
          lastUpdated: new Date()
        }];
      }
    });
  };
  
  // Update task status
  const updateTaskStatus = (taskId, status, info = null) => {
    addTask(taskId, status, info);
  };
  
  // Remove task from list
  const removeTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  // Clean up completed tasks older than 1 hour
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      setTasks(prevTasks => 
        prevTasks.filter(task => 
          ['pending', 'STARTED', 'PROGRESS'].includes(task.status) || 
          !task.lastUpdated || 
          new Date(task.lastUpdated) > oneHourAgo
        )
      );
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('appTitle')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <TaskStatusBar tasks={tasks} />
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            {t('appTitle')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('appDescription', 'Store, index, describe, and semantically search code fragments. Split, merge, and create intelligent, configurable templates. Generate new code fragments or complete unfinished ones using LLM.')}
          </Typography>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="code indexer tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('codeIngestion')} />
            <Tab label={t('codeSearch')} />
            <Tab label={t('chunkManipulation')} />
            <Tab label={t('templateManagement')} />
            <Tab label={t('codeAnalysis')} />
            <Tab label={t('export')} />
            <Tab label={t('tagsAndCategories')} />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <CodeIngestion 
            setLoading={setLoading} 
            handleNotification={handleNotification}
            addTask={addTask}
            updateTaskStatus={updateTaskStatus}
            removeTask={removeTask}
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
        
        {tabValue === 4 && (
          <CodeAnalysis 
            selectedChunks={selectedChunks}
            setLoading={setLoading} 
            handleNotification={handleNotification}
          />
        )}
        
        {tabValue === 5 && (
          <ExportFeature 
            selectedChunks={selectedChunks}
            setLoading={setLoading} 
            handleNotification={handleNotification}
          />
        )}
        
        {tabValue === 6 && (
          <TagsAndCategories 
            selectedChunks={selectedChunks}
            setLoading={setLoading} 
            handleNotification={handleNotification}
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
