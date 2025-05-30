import React, { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Grid, Divider, Slider, FormHelperText,
  Card, CardContent, List, Chip, Collapse
} from '@mui/material';
import { UploadFile, Code, ExpandMore, ExpandLess, ContentCopy } from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';

const CodeIngestion = ({ 
  setLoading, 
  handleNotification, 
  addTask, 
  updateTaskStatus, 
  removeTask 
}) => {
  const { t } = useTranslation();
  const [codeInput, setCodeInput] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [overlap, setOverlap] = useState(50);
  const [taskId, setTaskId] = useState(null);
  const [processedChunks, setProcessedChunks] = useState([]);
  const [expandedChunk, setExpandedChunk] = useState(null);

  const supportedLanguages = [
    'python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'sql', 
    'html', 'css', 'bash', 'powershell', 'yaml', 'json', 'xml'
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file && !codeInput) {
      handleNotification(t('provideCodeOrFile'), 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('code', codeInput);
    }
    
    if (name) formData.append('name', name);
    if (language) formData.append('language', language);
    formData.append('max_tokens', maxTokens);
    formData.append('overlap', overlap);

    try {
      const response = await fetch('http://localhost:8000/ingest/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        handleNotification(t('codeSubmittedForProcessing'), 'success');
        const newTaskId = data.task_id;
        setTaskId(newTaskId);
        
        // Add task to global state
        addTask(newTaskId, 'pending', {
          name: name || (file ? file.name : t('codeSnippet')),
          type: 'code_processing'
        });
        
        checkTaskStatus(newTaskId);
      } else {
        handleNotification(`${t('error')}: ${data.detail || t('failedToProcessCode')}`, 'error');
        setLoading(false);
      }
    } catch (error) {
      handleNotification(`${t('error')}: ${error.message}`, 'error');
      setLoading(false);
    }
  };

  const fetchProcessedChunks = async (chunkIds) => {
    try {
      setLoading(true);
      // Create a comma-separated list of chunk IDs for filtering
      const chunkIdsStr = chunkIds.join(',');
      
      // Fetch all chunks at once using a custom query
      const response = await fetch(`http://localhost:8000/search/?query=id:${chunkIdsStr}&limit=${chunkIds.length * 2}`);
      const data = await response.json();
      
      if (response.ok) {
        // Convert all IDs to numbers for consistent comparison
        const chunkIdsAsNumbers = chunkIds.map(id => Number(id));
        // Filter to only include the exact chunks we want, ensuring type consistency
        const filteredChunks = data.filter(chunk => chunkIdsAsNumbers.includes(Number(chunk.id)));
        console.log('Received chunks:', data);
        console.log('Filtered chunks:', filteredChunks);
        setProcessedChunks(filteredChunks);
        handleNotification(t('loadedProcessedFragments', { count: filteredChunks.length }), 'success');
      } else {
        handleNotification(`${t('error')}: ${data.detail || t('failedToFetchChunks')}`, 'error');
      }
    } catch (error) {
      handleNotification(`${t('error')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkTaskStatus = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/status/${id}`);
      const data = await response.json();
      
      // Update task status in global state
      updateTaskStatus(id, data.status, data.info);
      
      if (data.status === 'pending' || data.status === 'STARTED' || data.status === 'PROGRESS') {
        // Check again after 2 seconds
        setTimeout(() => checkTaskStatus(id), 2000);
      } else {
        setLoading(false);
        if (data.status === 'success') {
          handleNotification(t('codeProcessedSuccessfully'), 'success');
          
          // If processing was successful and we have chunk IDs, fetch the processed chunks
          if (data.info && data.info.chunk_ids && data.info.chunk_ids.length > 0) {
            fetchProcessedChunks(data.info.chunk_ids);
          }
        } else {
          handleNotification(`${t('processingFailed')}: ${data.info}`, 'error');
        }
      }
    } catch (error) {
      setLoading(false);
      updateTaskStatus(id, 'error', error.message);
      handleNotification(`${t('errorCheckingTaskStatus')}: ${error.message}`, 'error');
    }
  };

  const handleReset = () => {
    setCodeInput('');
    setFile(null);
    setName('');
    setLanguage('');
    setMaxTokens(1000);
    setOverlap(50);
    setProcessedChunks([]);
    
    // Remove task from global state if exists
    if (taskId) {
      removeTask(taskId);
      setTaskId(null);
    }
  };
  
  const handleExpandChunk = (id) => {
    setExpandedChunk(expandedChunk === id ? null : id);
  };
  
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    handleNotification(t('codeCopiedToClipboard'), 'success');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('codeIngestionTitle')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label={t('nameOptional')}
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            helperText={t('nameHelperText')}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('languageOptional')}</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label={t('languageOptional')}
            >
              <MenuItem value="">
                <em>{t('autoDetect')}</em>
              </MenuItem>
              {supportedLanguages.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {t('languageHelperText')}
            </FormHelperText>
          </FormControl>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              {t('maxTokensPerChunk', { maxTokens })}
            </Typography>
            <Slider
              value={maxTokens}
              onChange={(e, newValue) => setMaxTokens(newValue)}
              min={100}
              max={2000}
              step={100}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              {t('maxTokensHelperText')}
            </FormHelperText>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              {t('overlap', { overlap })}
            </Typography>
            <Slider
              value={overlap}
              onChange={(e, newValue) => setOverlap(newValue)}
              min={0}
              max={200}
              step={10}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              {t('overlapHelperText')}
            </FormHelperText>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TextField
              label={t('codeInput')}
              multiline
              rows={10}
              fullWidth
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              margin="normal"
              placeholder={t('enterCodeHere')}
              disabled={!!file}
            />
            
            <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
              {t('or')}
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              sx={{ mt: 1 }}
              disabled={!!codeInput}
            >
              {t('uploadFile')}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t('selectedFile', { fileName: file.name })}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          startIcon={<Code />}
          disabled={(!file && !codeInput) || !!taskId}
        >
          {t('processCode')}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleReset}
        >
          {t('reset')}
        </Button>
      </Box>
      
      {/* Processed Code Fragments Section */}
      {processedChunks.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            {t('processedCodeFragments', { count: processedChunks.length })}
          </Typography>
          
          <List sx={{ mt: 2 }}>
            {processedChunks.map((chunk) => (
              <Card key={chunk.id} sx={{ mb: 2 }}>
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
                  
                  <Button 
                    size="small" 
                    startIcon={expandedChunk === chunk.id ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => handleExpandChunk(chunk.id)}
                    sx={{ mt: 1 }}
                  >
                    {expandedChunk === chunk.id ? t('hideCode') : t('showCode')}
                  </Button>
                  
                  <Collapse in={expandedChunk === chunk.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                      <SyntaxHighlighter 
                        language={chunk.language} 
                        style={docco}
                        customStyle={{ maxHeight: '300px', overflow: 'auto' }}
                      >
                        {chunk.raw}
                      </SyntaxHighlighter>
                      
                      <Button 
                        size="small" 
                        startIcon={<ContentCopy />}
                        onClick={() => handleCopyCode(chunk.raw)}
                        sx={{ mt: 1 }}
                      >
                        {t('copyCode')}
                      </Button>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default CodeIngestion;
