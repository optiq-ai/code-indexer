import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  TextField, Chip, Autocomplete, List, ListItem, ListItemText,
  ListItemIcon, Divider, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  Label, Category, Add, Delete, Edit, Save, Close
} from '@mui/icons-material';
import axios from 'axios';

const TagsAndCategories = ({ selectedChunks, setLoading, handleNotification }) => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Symulacja danych dla celów demonstracyjnych
  React.useEffect(() => {
    // W rzeczywistej implementacji, pobieralibyśmy dane z API
    setTags([
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'Python' },
      { id: 3, name: 'React' },
      { id: 4, name: 'API' },
      { id: 5, name: 'Database' },
      { id: 6, name: 'Frontend' },
      { id: 7, name: 'Backend' },
      { id: 8, name: 'Security' }
    ]);
    
    setCategories([
      { id: 1, name: 'Utilities' },
      { id: 2, name: 'Components' },
      { id: 3, name: 'Algorithms' },
      { id: 4, name: 'Data Structures' },
      { id: 5, name: 'Configuration' }
    ]);
  }, []);

  const handleOpenTagDialog = () => {
    setOpenTagDialog(true);
  };

  const handleCloseTagDialog = () => {
    setOpenTagDialog(false);
    setNewTagName('');
  };

  const handleOpenCategoryDialog = () => {
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setNewCategoryName('');
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      handleNotification(t('enterTagName'), 'warning');
      return;
    }

    setProcessing(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      const newTag = {
        id: tags.length + 1,
        name: newTagName.trim()
      };
      
      setTags([...tags, newTag]);
      handleNotification(t('tagAdded'), 'success');
      setProcessing(false);
      handleCloseTagDialog();
    }, 1000);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      handleNotification(t('enterCategoryName'), 'warning');
      return;
    }

    setProcessing(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      const newCategory = {
        id: categories.length + 1,
        name: newCategoryName.trim()
      };
      
      setCategories([...categories, newCategory]);
      handleNotification(t('categoryCreated'), 'success');
      setProcessing(false);
      handleCloseCategoryDialog();
    }, 1000);
  };

  const handleAddTagsToChunks = () => {
    if (selectedChunks.length === 0) {
      handleNotification(t('selectChunksFirst'), 'warning');
      return;
    }

    if (selectedTags.length === 0) {
      handleNotification(t('selectTagsFirst'), 'warning');
      return;
    }

    setProcessing(true);
    setLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      // W rzeczywistej implementacji, wysłalibyśmy żądanie do API
      // const response = await axios.post('/api/chunks/tags', {
      //   chunkIds: selectedChunks.map(chunk => chunk.id),
      //   tagIds: selectedTags.map(tag => tag.id)
      // });
      
      handleNotification(
        t('tagsAddedToChunks', {
          tagCount: selectedTags.length,
          chunkCount: selectedChunks.length
        }),
        'success'
      );
      
      setProcessing(false);
      setLoading(false);
    }, 1500);
  };

  const handleAssignCategory = () => {
    if (selectedChunks.length === 0) {
      handleNotification(t('selectChunksFirst'), 'warning');
      return;
    }

    if (!selectedCategory) {
      handleNotification(t('selectCategoryFirst'), 'warning');
      return;
    }

    setProcessing(true);
    setLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      // W rzeczywistej implementacji, wysłalibyśmy żądanie do API
      // const response = await axios.post('/api/chunks/category', {
      //   chunkIds: selectedChunks.map(chunk => chunk.id),
      //   categoryId: selectedCategory.id
      // });
      
      handleNotification(
        t('chunksAssignedToCategory', {
          chunkCount: selectedChunks.length,
          category: selectedCategory.name
        }),
        'success'
      );
      
      setProcessing(false);
      setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('tagsAndCategories')}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {t('organizeCodeWithTagsAndCategories')}
        </Typography>
        
        {selectedChunks.length > 0 ? (
          <Grid container spacing={3}>
            {/* Sekcja tagów */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {t('manageTags')}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleOpenTagDialog}
                    >
                      {t('addTag')}
                    </Button>
                  </Box>
                  
                  <Autocomplete
                    multiple
                    id="tags-selector"
                    options={tags}
                    getOptionLabel={(option) => option.name}
                    value={selectedTags}
                    onChange={(event, newValue) => {
                      setSelectedTags(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label={t('selectTags')}
                        placeholder={t('selectTags')}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          icon={<Label />}
                        />
                      ))
                    }
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddTagsToChunks}
                    disabled={processing || selectedTags.length === 0}
                    startIcon={processing ? <CircularProgress size={24} /> : <Save />}
                    fullWidth
                  >
                    {processing ? t('processing') : t('applyTagsToSelectedChunks')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Sekcja kategorii */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {t('manageCategories')}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleOpenCategoryDialog}
                    >
                      {t('createCategory')}
                    </Button>
                  </Box>
                  
                  <Autocomplete
                    id="category-selector"
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    value={selectedCategory}
                    onChange={(event, newValue) => {
                      setSelectedCategory(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label={t('selectCategory')}
                        placeholder={t('selectCategory')}
                      />
                    )}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAssignCategory}
                    disabled={processing || !selectedCategory}
                    startIcon={processing ? <CircularProgress size={24} /> : <Save />}
                    fullWidth
                  >
                    {processing ? t('processing') : t('assignToCategory')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('selectChunksToOrganize')}
          </Alert>
        )}
      </Paper>
      
      {/* Dialog dodawania tagu */}
      <Dialog open={openTagDialog} onClose={handleCloseTagDialog}>
        <DialogTitle>{t('addTag')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="tag-name"
            label={t('tagName')}
            type="text"
            fullWidth
            variant="outlined"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTagDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleCreateTag} 
            color="primary" 
            disabled={processing || !newTagName.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog tworzenia kategorii */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog}>
        <DialogTitle>{t('createCategory')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="category-name"
            label={t('categoryName')}
            type="text"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleCreateCategory} 
            color="primary" 
            disabled={processing || !newCategoryName.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagsAndCategories;
