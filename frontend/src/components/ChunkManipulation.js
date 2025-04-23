import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Button, 
  Grid, Divider, Card, CardContent, 
  CardActions, TextField, Slider,
  FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, Chip,
  Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions
} from '@mui/material';
import { 
  CallSplit, Merge, Build, 
  Check, Delete, Warning 
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ChunkManipulation = ({ 
  setLoading, 
  handleNotification,
  selectedChunks,
  setSelectedChunks
}) => {
  const [maxTokens, setMaxTokens] = useState(1000);
  const [overlap, setOverlap] = useState(50);
  const [mergeName, setMergeName] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [chunkToComplete, setChunkToComplete] = useState(null);

  const handleSplitChunk = async (chunkId) => {
    if (!chunkId) {
      handleNotification('Please select a chunk to split', 'error');
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
        handleNotification(`Chunk split into ${data.child_ids.length} parts`, 'success');
        // Clear selected chunks after successful operation
        setSelectedChunks([]);
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to split chunk'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeChunks = async () => {
    if (selectedChunks.length < 2) {
      handleNotification('Please select at least two chunks to merge', 'error');
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
        handleNotification('Chunks merged successfully', 'success');
        setMergeName('');
        // Clear selected chunks after successful operation
        setSelectedChunks([]);
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to merge chunks'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
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
        handleNotification('Chunk completed successfully', 'success');
        // Update the selected chunks list to reflect the change
        setSelectedChunks(prevChunks => 
          prevChunks.map(chunk => 
            chunk.id === chunkToComplete.id 
              ? { ...chunk, incomplete: false, raw: data.raw } 
              : chunk
          )
        );
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to complete chunk'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      handleCloseCompleteDialog();
    }
  };

  const handleClearSelection = () => {
    setSelectedChunks([]);
    handleNotification('Selection cleared', 'info');
  };

  const hasSameLanguage = () => {
    if (selectedChunks.length < 2) return true;
    const firstLanguage = selectedChunks[0].language;
    return selectedChunks.every(chunk => chunk.language === firstLanguage);
  };

  const hasIncompleteChunks = () => {
    return selectedChunks.some(chunk => chunk.incomplete);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manipulate Code Chunks
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Split Chunk
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Split a single code chunk into multiple smaller chunks based on token size.
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Max Tokens per Chunk: {maxTokens}
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
                  Overlap: {overlap}
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
                Split Chunk
              </Button>
            </CardActions>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Merge Chunks
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Merge multiple code chunks into a single larger chunk.
              </Typography>
              
              <TextField
                label="Name for Merged Chunk (Optional)"
                fullWidth
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
                margin="normal"
              />
              
              {!hasSameLanguage() && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  Warning: Selected chunks have different languages. Merging may result in invalid code.
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
                Merge Chunks
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Selected Chunks ({selectedChunks.length})
                </Typography>
                {selectedChunks.length > 0 && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<Delete />}
                    onClick={handleClearSelection}
                  >
                    Clear
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
                                label="Incomplete" 
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
                            <SyntaxHighlighter 
                              language={chunk.language} 
                              style={docco}
                              customStyle={{ maxHeight: '100px', overflow: 'auto' }}
                            >
                              {chunk.raw.length > 200 
                                ? chunk.raw.substring(0, 200) + '...' 
                                : chunk.raw}
                            </SyntaxHighlighter>
                            
                            {chunk.incomplete && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="warning"
                                startIcon={<Build />}
                                onClick={() => handleOpenCompleteDialog(chunk)}
                                sx={{ mt: 1 }}
                              >
                                Complete Chunk
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
                    No chunks selected. Select chunks from the Search tab.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          
          {hasIncompleteChunks() && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Note: Some selected chunks are incomplete. You can complete them individually 
                using the "Complete Chunk" button, or merge them with other chunks.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Complete Chunk Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={handleCloseCompleteDialog}
      >
        <DialogTitle>Complete Incomplete Chunk</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will use AI to complete the incomplete code chunk. The AI will attempt to:
            <ul>
              <li>Close all open brackets, parentheses, and braces</li>
              <li>Complete any unfinished functions or classes</li>
              <li>Add necessary imports if they're missing</li>
              <li>Fix any syntax errors</li>
            </ul>
            Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCompleteChunk} color="primary" variant="contained" startIcon={<Check />}>
            Complete Chunk
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ChunkManipulation;
