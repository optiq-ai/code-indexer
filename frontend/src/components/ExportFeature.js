import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Checkbox, FormGroup, CircularProgress, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  GetApp, Description, TableChart, PictureAsPdf, Code
} from '@mui/icons-material';
import axios from 'axios';

const ExportFeature = ({ selectedChunks, setLoading, handleNotification }) => {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState('json');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeAnalysis: false,
    includeComments: true
  });
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState(null);

  const handleFormatChange = (event) => {
    setExportFormat(event.target.value);
  };

  const handleOptionChange = (event) => {
    setExportOptions({
      ...exportOptions,
      [event.target.name]: event.target.checked
    });
  };

  const exportData = async () => {
    if (selectedChunks.length === 0) {
      handleNotification(t('selectChunksToExport'), 'warning');
      return;
    }

    setExporting(true);
    setLoading(true);
    setExportUrl(null);

    try {
      // Przygotuj dane do eksportu
      const dataToExport = {
        chunks: selectedChunks.map(chunk => ({
          id: chunk.id,
          code: chunk.code,
          language: chunk.language,
          metadata: exportOptions.includeMetadata ? {
            created_at: chunk.created_at,
            updated_at: chunk.updated_at,
            description: chunk.description
          } : undefined,
          analysis: exportOptions.includeAnalysis ? {
            // Tutaj byłyby dane analizy, jeśli są dostępne
          } : undefined,
          comments: exportOptions.includeComments ? chunk.comments : undefined
        })),
        format: exportFormat,
        options: exportOptions
      };

      // W rzeczywistej implementacji, wywołalibyśmy API eksportu
      // const response = await axios.post('/api/export', dataToExport);
      // setExportUrl(response.data.downloadUrl);
      
      // Dla celów demonstracyjnych, symulujemy odpowiedź
      simulateExport(dataToExport);
    } catch (error) {
      console.error('Error exporting data:', error);
      handleNotification(t('errorOccurred') + ': ' + (error.response?.data?.message || error.message), 'error');
      setExporting(false);
      setLoading(false);
    }
  };

  // Symulacja eksportu dla celów demonstracyjnych
  const simulateExport = (data) => {
    // Symulacja opóźnienia odpowiedzi API
    setTimeout(() => {
      // Generowanie przykładowego pliku do pobrania
      let content = '';
      let mimeType = '';
      let fileExtension = '';
      
      if (data.format === 'json') {
        content = JSON.stringify(data.chunks, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      } else if (data.format === 'csv') {
        // Bardzo uproszczona konwersja do CSV
        const headers = ['id', 'language', 'code'];
        content = headers.join(',') + '\n';
        data.chunks.forEach(chunk => {
          content += `${chunk.id},"${chunk.language}","${chunk.code.replace(/"/g, '""')}"\n`;
        });
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else if (data.format === 'excel') {
        // W rzeczywistej implementacji użylibyśmy biblioteki do generowania plików Excel
        // Tutaj symulujemy CSV jako zastępstwo
        const headers = ['id', 'language', 'code'];
        content = headers.join(',') + '\n';
        data.chunks.forEach(chunk => {
          content += `${chunk.id},"${chunk.language}","${chunk.code.replace(/"/g, '""')}"\n`;
        });
        mimeType = 'text/csv';
        fileExtension = 'csv'; // W rzeczywistości byłoby 'xlsx'
      } else if (data.format === 'pdf') {
        // W rzeczywistej implementacji użylibyśmy biblioteki do generowania PDF
        // Tutaj symulujemy tekst jako zastępstwo
        content = 'This is a simulated PDF content.\n\n';
        data.chunks.forEach(chunk => {
          content += `ID: ${chunk.id}\nLanguage: ${chunk.language}\nCode:\n${chunk.code}\n\n`;
        });
        mimeType = 'text/plain';
        fileExtension = 'txt'; // W rzeczywistości byłoby 'pdf'
      }
      
      // Tworzenie Blob i URL do pobrania
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      setExportUrl(url);
      handleNotification(t('exportSuccessful'), 'success');
      setExporting(false);
      setLoading(false);
      
      // Automatyczne pobieranie pliku
      const a = document.createElement('a');
      a.href = url;
      a.download = `code_export_${new Date().getTime()}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 2000);
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'json':
        return <Code />;
      case 'csv':
        return <TableChart />;
      case 'excel':
        return <TableChart />;
      case 'pdf':
        return <PictureAsPdf />;
      default:
        return <Description />;
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('exportTitle')}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {t('exportSelected')}
        </Typography>
        
        {selectedChunks.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">{t('exportFormat')}</FormLabel>
                    <RadioGroup
                      aria-label="export-format"
                      name="export-format"
                      value={exportFormat}
                      onChange={handleFormatChange}
                    >
                      <FormControlLabel value="json" control={<Radio />} label={t('exportToJson')} />
                      <FormControlLabel value="csv" control={<Radio />} label={t('exportToCsv')} />
                      <FormControlLabel value="excel" control={<Radio />} label={t('exportToExcel')} />
                      <FormControlLabel value="pdf" control={<Radio />} label={t('exportToPdf')} />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">{t('exportOptions')}</FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={exportOptions.includeMetadata} 
                            onChange={handleOptionChange} 
                            name="includeMetadata" 
                          />
                        }
                        label={t('includeMetadata')}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={exportOptions.includeAnalysis} 
                            onChange={handleOptionChange} 
                            name="includeAnalysis" 
                          />
                        }
                        label={t('includeAnalysis')}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={exportOptions.includeComments} 
                            onChange={handleOptionChange} 
                            name="includeComments" 
                          />
                        }
                        label={t('includeComments')}
                      />
                    </FormGroup>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={exportData} 
                  disabled={exporting}
                  startIcon={exporting ? <CircularProgress size={24} /> : getFormatIcon()}
                >
                  {exporting ? t('preparingExport') : t('export')}
                </Button>
                
                {exportUrl && (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    href={exportUrl}
                    download={`code_export.${exportFormat}`}
                    startIcon={<GetApp />}
                  >
                    {t('downloadExport')}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('selectChunksToExport')}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ExportFeature;
