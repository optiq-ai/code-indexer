import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  TextField, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  Merge, CallSplit, Code, Description, Save
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const EnhancedChunkManipulation = ({ selectedChunks, setLoading, handleNotification }) => {
  const { t } = useTranslation();
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
  const [splitPoint, setSplitPoint] = useState('');
  const [completionPrompt, setCompletionPrompt] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Obsługa łączenia fragmentów
  const handleOpenMergeDialog = () => {
    if (selectedChunks.length < 2) {
      handleNotification(t('selectAtLeastTwoChunks'), 'warning');
      return;
    }
    setMergeDialogOpen(true);
  };

  const handleCloseMergeDialog = () => {
    setMergeDialogOpen(false);
    setResult(null);
  };

  const handleMergeChunks = () => {
    setProcessing(true);
    setLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      // W rzeczywistej implementacji, wysłalibyśmy żądanie do API
      // const response = await axios.post('/api/chunks/merge', {
      //   chunkIds: selectedChunks.map(chunk => chunk.id)
      // });
      
      // Symulacja wyniku
      const mergedCode = selectedChunks
        .sort((a, b) => a.id - b.id)
        .map(chunk => chunk.code)
        .join('\n\n');
      
      const mergeResult = {
        id: Math.max(...selectedChunks.map(chunk => chunk.id)) + 1,
        code: mergedCode,
        language: selectedChunks[0].language
      };
      
      setResult(mergeResult);
      handleNotification(t('chunksMerged'), 'success');
      setProcessing(false);
      setLoading(false);
    }, 1500);
  };

  // Obsługa podziału fragmentu
  const handleOpenSplitDialog = () => {
    if (selectedChunks.length !== 1) {
      handleNotification(t('selectExactlyOneChunk'), 'warning');
      return;
    }
    setSplitDialogOpen(true);
  };

  const handleCloseSplitDialog = () => {
    setSplitDialogOpen(false);
    setSplitPoint('');
    setResult(null);
  };

  const handleSplitChunk = () => {
    if (!splitPoint.trim()) {
      handleNotification(t('enterSplitPoint'), 'warning');
      return;
    }

    setProcessing(true);
    setLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      // W rzeczywistej implementacji, wysłalibyśmy żądanie do API
      // const response = await axios.post('/api/chunks/split', {
      //   chunkId: selectedChunks[0].id,
      //   splitPoint: splitPoint
      // });
      
      // Symulacja wyniku
      const originalCode = selectedChunks[0].code;
      const splitIndex = originalCode.indexOf(splitPoint);
      
      if (splitIndex === -1) {
        handleNotification(t('splitPointNotFound'), 'error');
        setProcessing(false);
        setLoading(false);
        return;
      }
      
      const firstPart = originalCode.substring(0, splitIndex);
      const secondPart = originalCode.substring(splitIndex);
      
      const splitResult = {
        original: selectedChunks[0],
        chunks: [
          {
            id: selectedChunks[0].id,
            code: firstPart,
            language: selectedChunks[0].language
          },
          {
            id: Math.max(...selectedChunks.map(chunk => chunk.id)) + 1,
            code: secondPart,
            language: selectedChunks[0].language
          }
        ]
      };
      
      setResult(splitResult);
      handleNotification(t('chunkSplit'), 'success');
      setProcessing(false);
      setLoading(false);
    }, 1500);
  };

  // Obsługa generowania opisu
  const handleOpenDescriptionDialog = () => {
    if (selectedChunks.length !== 1) {
      handleNotification(t('selectExactlyOneChunk'), 'warning');
      return;
    }
    setDescriptionDialogOpen(true);
  };

  const handleCloseDescriptionDialog = () => {
    setDescriptionDialogOpen(false);
    setDescription('');
    setResult(null);
  };

  const handleGenerateDescription = () => {
    setProcessing(true);
    setLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      // W rzeczywistej implementacji, wysłalibyśmy żądanie do API
      // const response = await axios.post('/api/chunks/generate-description', {
      //   chunkId: selectedChunks[0].id
      // });
      
      // Symulacja wyniku
      const chunk = selectedChunks[0];
      let generatedDescription = '';
      
      if (chunk.language === 'python') {
        generatedDescription = 'Ta funkcja Pythona implementuje algorytm sortowania przez wstawianie. Przyjmuje listę jako argument i zwraca posortowaną listę. Złożoność czasowa: O(n²), gdzie n to długość listy.';
      } else if (chunk.language === 'javascript') {
        generatedDescription = 'Ten fragment kodu JavaScript definiuje funkcję asynchroniczną, która pobiera dane z API i przetwarza odpowiedź. Używa składni async/await do obsługi obietnic.';
      } else if (chunk.language === 'java') {
        generatedDescription = 'Ta klasa Java implementuje wzorzec projektowy Singleton. Zapewnia globalny punkt dostępu do instancji klasy i gwarantuje, że istnieje tylko jedna instancja.';
      } else {
        generatedDescription = 'Ten fragment kodu implementuje podstawową funkcjonalność przetwarzania danych. Zawiera logikę biznesową do manipulacji danymi wejściowymi i generowania wyników.';
      }
      
      setDescription(generatedDescription);
      setResult({
        id: chunk.id,
        description: generatedDescription
      });
      
      handleNotification(t('descriptionGenerated'), 'success');
      setProcessing(false);
      setLoading(false);
    }, 2000);
  };

  // Obsługa generowania uzupełnienia
  const handleOpenCompletionDialog = () => {
    if (selectedChunks.length !== 1) {
      handleNotification(t('selectExactlyOneChunk'), 'warning');
      return;
    }
    setCompletionDialogOpen(true);
  };

  const handleCloseCompletionDialog = () => {
    setCompletionDialogOpen(false);
    setCompletionPrompt('');
    setResult(null);
  };

  const handleGenerateCompletion = () => {
    setProcessing(true);
    setLoading(true);
    
    // Symulacja opóźnienia API
    setTimeout(() => {
      // W rzeczywistej implementacji, wysłalibyśmy żądanie do API
      // const response = await axios.post('/api/chunks/generate-completion', {
      //   chunkId: selectedChunks[0].id,
      //   prompt: completionPrompt
      // });
      
      // Symulacja wyniku
      const chunk = selectedChunks[0];
      let generatedCompletion = '';
      
      if (chunk.language === 'python') {
        generatedCompletion = chunk.code + '\n\n# Dodatkowa funkcja do testowania\ndef test_sort():\n    """Test funkcji sortowania."""\n    test_cases = [\n        [5, 2, 9, 1, 5, 6],\n        [3, 1],\n        [1],\n        []\n    ]\n    \n    for tc in test_cases:\n        sorted_list = insertion_sort(tc.copy())\n        assert sorted_list == sorted(tc), f"Test failed for {tc}"\n    \n    print("All tests passed!")\n\nif __name__ == "__main__":\n    test_sort()';
      } else if (chunk.language === 'javascript') {
        generatedCompletion = chunk.code + '\n\n// Dodatkowa funkcja do obsługi błędów\nasync function handleApiError(error) {\n  console.error("API error:", error);\n  \n  if (error.response) {\n    // Błąd odpowiedzi serwera\n    const { status, data } = error.response;\n    \n    if (status === 401) {\n      // Nieautoryzowany dostęp\n      await refreshToken();\n      return retryRequest();\n    } else if (status === 404) {\n      // Zasób nie znaleziony\n      return { error: "Resource not found", code: 404 };\n    } else {\n      // Inny błąd serwera\n      return { error: data.message || "Server error", code: status };\n    }\n  } else if (error.request) {\n    // Brak odpowiedzi\n    return { error: "No response from server", code: 0 };\n  } else {\n    // Błąd konfiguracji\n    return { error: "Request configuration error", code: -1 };\n  }\n}';
      } else {
        generatedCompletion = chunk.code + '\n\n// Dodatkowa funkcjonalność\n// Generowana na podstawie istniejącego kodu\n// i podpowiedzi użytkownika: ' + completionPrompt + '\n\n// Implementacja dodatkowych funkcji\nfunction processAdditionalData(data) {\n  // Walidacja danych wejściowych\n  if (!data || typeof data !== "object") {\n    throw new Error("Invalid data format");\n  }\n  \n  // Przetwarzanie danych\n  const results = Object.entries(data).map(([key, value]) => {\n    return {\n      id: key,\n      processed: typeof value === "string" ? value.toUpperCase() : value,\n      timestamp: new Date().toISOString()\n    };\n  });\n  \n  return results;\n}';
      }
      
      setResult({
        id: chunk.id,
        code: generatedCompletion,
        language: chunk.language
      });
      
      handleNotification(t('completionGenerated'), 'success');
      setProcessing(false);
      setLoading(false);
    }, 2500);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('enhancedChunkManipulation')}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {t('manipulateCodeChunks')}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Merge />}
              onClick={handleOpenMergeDialog}
              fullWidth
              sx={{ height: '100%' }}
            >
              {t('mergeChunks')}
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CallSplit />}
              onClick={handleOpenSplitDialog}
              fullWidth
              sx={{ height: '100%' }}
            >
              {t('splitChunk')}
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Code />}
              onClick={handleOpenCompletionDialog}
              fullWidth
              sx={{ height: '100%' }}
            >
              {t('generateCompletion')}
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Description />}
              onClick={handleOpenDescriptionDialog}
              fullWidth
              sx={{ height: '100%' }}
            >
              {t('generateDescription')}
            </Button>
          </Grid>
        </Grid>
        
        {selectedChunks.length === 0 && (
          <Alert severity="info">
            {t('selectChunksToManipulate')}
          </Alert>
        )}
      </Paper>
      
      {/* Dialog łączenia fragmentów */}
      <Dialog
        open={mergeDialogOpen}
        onClose={handleCloseMergeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('mergeChunks')}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('selectedChunks')}: {selectedChunks.length}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {selectedChunks.map((chunk, index) => (
              <Card key={chunk.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('chunkId')}: {chunk.id} ({chunk.language})
                  </Typography>
                  <SyntaxHighlighter language={chunk.language} style={docco}>
                    {chunk.code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          {result && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('mergeResult')}
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('newChunkId')}: {result.id} ({result.language})
                  </Typography>
                  <SyntaxHighlighter language={result.language} style={docco}>
                    {result.code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMergeDialog} color="primary">
            {t('close')}
          </Button>
          <Button 
            onClick={handleMergeChunks} 
            color="primary" 
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Save />}
          >
            {processing ? t('processing') : t('mergeChunks')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog podziału fragmentu */}
      <Dialog
        open={splitDialogOpen}
        onClose={handleCloseSplitDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('splitChunk')}</DialogTitle>
        <DialogContent>
          {selectedChunks.length === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('chunkToSplit')}:
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('chunkId')}: {selectedChunks[0].id} ({selectedChunks[0].language})
                  </Typography>
                  <SyntaxHighlighter language={selectedChunks[0].language} style={docco}>
                    {selectedChunks[0].code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
              
              <TextField
                label={t('enterSplitPoint')}
                helperText={t('splitPointHelp')}
                fullWidth
                multiline
                rows={2}
                value={splitPoint}
                onChange={(e) => setSplitPoint(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          
          {result && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('splitResult')}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                {t('firstPart')}:
              </Typography>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('chunkId')}: {result.chunks[0].id} ({result.chunks[0].language})
                  </Typography>
                  <SyntaxHighlighter language={result.chunks[0].language} style={docco}>
                    {result.chunks[0].code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
              
              <Typography variant="subtitle1" gutterBottom>
                {t('secondPart')}:
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('chunkId')}: {result.chunks[1].id} ({result.chunks[1].language})
                  </Typography>
                  <SyntaxHighlighter language={result.chunks[1].language} style={docco}>
                    {result.chunks[1].code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSplitDialog} color="primary">
            {t('close')}
          </Button>
          <Button 
            onClick={handleSplitChunk} 
            color="primary" 
            disabled={processing || !splitPoint.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : <Save />}
          >
            {processing ? t('processing') : t('splitChunk')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog generowania opisu */}
      <Dialog
        open={descriptionDialogOpen}
        onClose={handleCloseDescriptionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('generateDescription')}</DialogTitle>
        <DialogContent>
          {selectedChunks.length === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('selectedChunk')}:
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('chunkId')}: {selectedChunks[0].id} ({selectedChunks[0].language})
                  </Typography>
                  <SyntaxHighlighter language={selectedChunks[0].language} style={docco}>
                    {selectedChunks[0].code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Box>
          )}
          
          {description && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('generatedDescription')}:
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="body1">
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescriptionDialog} color="primary">
            {t('close')}
          </Button>
          <Button 
            onClick={handleGenerateDescription} 
            color="primary" 
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Description />}
          >
            {processing ? t('generating') : t('generateDescription')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog generowania uzupełnienia */}
      <Dialog
        open={completionDialogOpen}
        onClose={handleCloseCompletionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('generateCompletion')}</DialogTitle>
        <DialogContent>
          {selectedChunks.length === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('selectedChunk')}:
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('chunkId')}: {selectedChunks[0].id} ({selectedChunks[0].language})
                  </Typography>
                  <SyntaxHighlighter language={selectedChunks[0].language} style={docco}>
                    {selectedChunks[0].code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
              
              <TextField
                label={t('enterCompletionPrompt')}
                helperText={t('completionPromptHelp')}
                fullWidth
                multiline
                rows={2}
                value={completionPrompt}
                onChange={(e) => setCompletionPrompt(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          
          {result && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('generatedCompletion')}:
              </Typography>
              <Card>
                <CardContent>
                  <SyntaxHighlighter language={result.language} style={docco}>
                    {result.code}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompletionDialog} color="primary">
            {t('close')}
          </Button>
          <Button 
            onClick={handleGenerateCompletion} 
            color="primary" 
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Code />}
          >
            {processing ? t('generating') : t('generateCompletion')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedChunkManipulation;
