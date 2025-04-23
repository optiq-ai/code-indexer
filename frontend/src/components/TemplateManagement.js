import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, 
  Grid, Divider, Card, CardContent, 
  CardActions, TextField, List, ListItem,
  ListItemText, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  Add, Save,
  PlayArrow, Visibility, VisibilityOff
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const TemplateManagement = ({ 
  setLoading, 
  handleNotification,
  selectedChunks
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [parameters, setParameters] = useState({});
  const [parameterKeys, setParameterKeys] = useState([]);
  const [viewTemplateCode, setViewTemplateCode] = useState(false);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/templates/');
      const data = await response.json();
      
      if (response.ok) {
        setTemplates(data);
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to fetch templates'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    if (selectedChunks.length === 0) {
      handleNotification('Please select at least one chunk to create a template', 'error');
      return;
    }
    
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleCreateTemplate = async () => {
    if (!templateName) {
      handleNotification('Please enter a template name', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', templateName);
      
      if (templateDescription) {
        formData.append('description', templateDescription);
      }
      
      selectedChunks.forEach(chunk => {
        formData.append('chunk_ids', chunk.id);
      });

      const response = await fetch('http://localhost:8000/templates/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        handleNotification('Template created successfully', 'success');
        fetchTemplates();
        handleCloseCreateDialog();
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to create template'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/templates/${templateId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedTemplate(data);
        
        // Extract parameter keys from template chunks
        const keys = new Set();
        data.chunks.forEach(chunk => {
          const matches = chunk.description?.match(/\{\{\$([a-zA-Z0-9_]+)\}\}/g) || [];
          matches.forEach(match => {
            const key = match.replace('{{$', '').replace('}}', '');
            keys.add(key);
          });
        });
        
        setParameterKeys(Array.from(keys));
        
        // Initialize parameters object
        const initialParams = {};
        keys.forEach(key => {
          initialParams[key] = '';
        });
        setParameters(initialParams);
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to fetch template details'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyDialog = () => {
    if (!selectedTemplate) {
      handleNotification('Please select a template first', 'error');
      return;
    }
    
    setApplyDialogOpen(true);
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
  };

  const handleParameterChange = (key, value) => {
    setParameters({
      ...parameters,
      [key]: value
    });
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      handleCloseApplyDialog();
      return;
    }

    // Check if all parameters are filled
    const missingParams = parameterKeys.filter(key => !parameters[key]);
    if (missingParams.length > 0) {
      handleNotification(`Please fill in all parameters: ${missingParams.join(', ')}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('parameters', JSON.stringify(parameters));

      const response = await fetch(`http://localhost:8000/templates/${selectedTemplate.id}/apply/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        handleNotification('Template applied successfully', 'success');
        handleCloseApplyDialog();
      } else {
        handleNotification(`Error: ${data.detail || 'Failed to apply template'}`, 'error');
      }
    } catch (error) {
      handleNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Template Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Available Templates
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  startIcon={<Add />}
                  onClick={handleOpenCreateDialog}
                >
                  Create New
                </Button>
              </Box>
              
              {templates.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Chunks</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow 
                          key={template.id}
                          selected={selectedTemplate?.id === template.id}
                          hover
                          onClick={() => handleSelectTemplate(template.id)}
                        >
                          <TableCell>{template.name}</TableCell>
                          <TableCell>{template.description || '-'}</TableCell>
                          <TableCell>{template.chunk_count}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template.id);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No templates available. Create a new template from selected chunks.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Template Details
                </Typography>
                {selectedTemplate && (
                  <IconButton 
                    color="primary"
                    onClick={() => setViewTemplateCode(!viewTemplateCode)}
                  >
                    {viewTemplateCode ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )}
              </Box>
              
              {selectedTemplate ? (
                <Box>
                  <Typography variant="subtitle1">
                    {selectedTemplate.name}
                  </Typography>
                  
                  {selectedTemplate.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedTemplate.description}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Chunks ({selectedTemplate.chunks.length}):
                  </Typography>
                  
                  <List>
                    {selectedTemplate.chunks.map((chunk) => (
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
                              <Chip 
                                label={`Position: ${chunk.position + 1}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ ml: 1 }} 
                              />
                            </Box>
                          }
                          secondary={chunk.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {viewTemplateCode && selectedTemplate.chunks.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Template Code:
                      </Typography>
                      
                      {selectedTemplate.chunks.map((chunk, index) => (
                        <Box key={chunk.id} sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Chunk {index + 1}: {chunk.name}
                          </Typography>
                          <SyntaxHighlighter 
                            language={chunk.language} 
                            style={docco}
                            customStyle={{ maxHeight: '200px', overflow: 'auto' }}
                          >
                            {chunk.code || '// Code not available in preview'}
                          </SyntaxHighlighter>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {parameterKeys.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Template Parameters:
                      </Typography>
                      
                      {parameterKeys.map((key) => (
                        <Box key={key} sx={{ mb: 1 }}>
                          <Chip 
                            label={key} 
                            size="small" 
                            color="secondary" 
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Select a template to view details.
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            {selectedTemplate && (
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<PlayArrow />}
                  onClick={handleOpenApplyDialog}
                >
                  Apply Template
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Create Template Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Template</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Create a template from the selected code chunks. Templates can be used to generate new code with customizable parameters.
          </DialogContentText>
          
          <TextField
            label="Template Name"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            label="Template Description"
            fullWidth
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Selected Chunks ({selectedChunks.length}):
          </Typography>
          
          <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
            {selectedChunks.map((chunk, index) => (
              <ListItem key={chunk.id} divider dense>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {index + 1}. {chunk.name}
                      <Chip 
                        label={chunk.language} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }} 
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Tip: You can use placeholders like {'{'}{'{'}'$parameterName'{'}'}{'}'}' in your code to create customizable templates.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate} color="primary" variant="contained" startIcon={<Save />}>
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Apply Template Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={handleCloseApplyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Apply Template: {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Fill in the parameters to apply this template and generate new code.
          </DialogContentText>
          
          {parameterKeys.length > 0 ? (
            <Box>
              {parameterKeys.map((key) => (
                <TextField
                  key={key}
                  label={key}
                  fullWidth
                  value={parameters[key] || ''}
                  onChange={(e) => handleParameterChange(key, e.target.value)}
                  margin="normal"
                  required
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              This template has no customizable parameters.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplyDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleApplyTemplate} color="primary" variant="contained" startIcon={<PlayArrow />}>
            Apply Template
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TemplateManagement;
