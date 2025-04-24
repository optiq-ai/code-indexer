import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, 
  Grid, Card, CardContent, 
  CardActions, TextField, Slider,
  List, ListItem, ListItemText, Chip,
  Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Divider,
  Tooltip, IconButton
} from '@mui/material';
import { 
  CallSplit, Merge, Build, 
  Check, Delete, Warning,
  TextFields, ContentCopy
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import EnhancedChunkManipulation from './EnhancedChunkManipulation';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ChunkManipulation = ({ 
  setLoading, 
  handleNotification,
  selectedChunks,
  setSelectedChunks
}) => {
  const { t } = useTranslation();
  const [maxTokens, setMaxTokens] = useState(1000);
  const [overlap, setOverlap] = useState(50);
  const [mergeName, setMergeName] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [chunkToComplete, setChunkToComplete] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const codeRefs = useRef({});

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

  const handleSplitChunk = async (chunkId) => {
    if (!chunkId) {
      handleNotification(t('selectChunkToSplit'), 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('chunk_id', chunkId);
      formData.append('max_tokens', maxTokens);
      formData.append('overlap', overlap);

      const response = await fetch('http://localhost:8000/chunks/split/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        handleNotification(t('chunkSplitSuccess', { count: data.child_ids.length }), 'success');
        // Clear selected chunks after successful operation
        setSelectedChunks([]);
      } else {
        handleNotification(`${t('error')}: ${data.detail || t('failedToSplitChunk')}`, 'error');
      }
    } catch (error) {
      handleNotification(`${t('error')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeChunks = async () => {
    if (selectedChunks.length < 2) {
      handleNotification(t('selectAtLeastTwoChunks'), 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      selectedChunks.forEach(chunk => {
        formData.append('chunk_ids', chunk.id);
      });
      
      if (mergeName) {
        formData.append('name', mergeName);
      }

      const response = await fetch('http://localhost:8000/chunks/merge/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        handleNotification(t('chunksMerged'), 'success');
        setMergeName('');
        // Clear selected chunks after successful operation
        setSelectedChunks([]);
      } else {
        handleNotification(`${t('error')}: ${data.detail || t('failedToMergeChunks')}`, 'error');
      }
    } catch (error) {
      handleNotification(`${t('error')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompleteDialog = (chunk) => {
    setChunkToComplete(chunk);
    setCompleteDialogOpen(true);
  };

  const handleCloseCompleteDialog = () => {
    setCompleteDialogOpen(false);
    setChunkToComplete(null);
  };

  const handleCompleteChunk = async () => {
    if (!chunkToComplete) {
      handleCloseCompleteDialog();
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('chunk_id', chunkToComplete.id);

      const response = await fetch('http://localhost:8000/chunks/complete/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        handleNotification(t('chunkCompletedSuccess'), 'success');
        // Update the selected chunks list to reflect the change
        setSelectedChunks(prevChunks => 
          prevChunks.map(chunk => 
            chunk.id === chunkToComplete.id 
              ? { ...chunk, incomplete: false, raw: data.raw } 
              : chunk
          )
        );
      } else {
        handleNotification(`${t('error')}: ${data.detail || t('failedToCompleteChunk')}`, 'error');
      }
    } catch (error) {
      handleNotification(`${t('error')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      handleCloseCompleteDialog();
    }
  };

  const handleClearSelection = () => {
    setSelectedChunks([]);
    handleNotification(t('selectionCleared'), 'info');
  };

  const handleCopySelectedText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      handleNotification(t('selectedTextCopied'), 'success');
    } else {
      handleNotification(t('noTextSelected'), 'warning');
    }
  };

  const hasSameLanguage = () => {
    if (selectedChunks.length < 2) return true;
    const firstLanguage = selectedChunks[0].language;
    return selectedChunks.every(chunk => chunk.language === firstLanguage);
  };

  const hasIncompleteChunks = () => {
    return selectedChunks.some(chunk => chunk.incomplete);
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
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('chunkManipulationTitle')}
        </Typography>
      
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('splitChunk')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('splitChunkDescription')}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    {t('maxTokensPerChunk')}: {maxTokens}
                  </Typography>
                  <Slider
                    value={maxTokens}
                    onChange={(e, newValue) => setMaxTokens(newValue)}
                    min={100}
                    max={2000}
                    step={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    {t('overlap')}: {overlap}
                  </Typography>
                  <Slider
                    value={overlap}
                    onChange={(e, newValue) => setOverlap(newValue)}
                    min={0}
                    max={200}
                    step={10}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<CallSplit />}
                  onClick={() => handleSplitChunk(selectedChunks[0]?.id)}
                  disabled={selectedChunks.length !== 1}
                >
                  {t('splitChunk')}
                </Button>
              </CardActions>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('mergeChunks')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('mergeChunksDescription')}
                </Typography>
                
                <TextField
                  label={t('nameForMergedChunk')}
                  fullWidth
                  value={mergeName}
                  onChange={(e) => setMergeName(e.target.value)}
                  margin="normal"
                />
                
                {!hasSameLanguage() && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    {t('differentLanguagesWarning')}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Merge />}
                  onClick={handleMergeChunks}
                  disabled={selectedChunks.length < 2}
                >
                  {t('mergeChunks')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {t('selectedChunks')} ({selectedChunks.length})
                  </Typography>
                  {selectedChunks.length > 0 && (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      startIcon={<Delete />}
                      onClick={handleClearSelection}
                    >
                      {t('clear')}
                    </Button>
                  )}
                </Box>
                
                {selectedChunks.length > 0 ? (
                  <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                    {selectedChunks.map((chunk) => (
                      <ListItem key={chunk.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {chunk.name}
                              <Chip 
                                label={chunk.language} 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }} 
                              />
                              {chunk.incomplete && (
                                <Chip 
                                  label={t('incomplete')} 
                                  size="small" 
                                  color="warning" 
                                  sx={{ ml: 1 }} 
                                  icon={<Warning fontSize="small" />}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {renderSelectableCode(chunk.raw, chunk.language, chunk.id)}
                              
                              {chunk.incomplete && (
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="warning"
                                  startIcon={<Build />}
                                  onClick={() => handleOpenCompleteDialog(chunk)}
                                  sx={{ mt: 1 }}
                                >
                                  {t('completeChunk')}
                                </Button>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {t('noChunksSelected')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            {hasIncompleteChunks() && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('incompleteChunksNote')}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Enhanced Chunk Manipulation */}
      <EnhancedChunkManipulation 
        selectedChunks={selectedChunks}
        setLoading={setLoading}
        handleNotification={handleNotification}
      />
      
      {/* Complete Chunk Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={handleCloseCompleteDialog}
      >
        <DialogTitle>{t('completeIncompleteChunk')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('completeChunkDescription')}
            <ul>
              <li>{t('completeChunkAction1')}</li>
              <li>{t('completeChunkAction2')}</li>
              <li>{t('completeChunkAction3')}</li>
              <li>{t('completeChunkAction4')}</li>
            </ul>
            {t('doYouWantToProceed')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleCompleteChunk} color="primary" variant="contained" startIcon={<Check />}>
            {t('completeChunk')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChunkManipulation;
