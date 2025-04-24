import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  CardHeader, Divider, List, ListItem, ListItemText, 
  ListItemIcon, CircularProgress, Chip, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, Error, Warning, Info, 
  Security, Speed, Build, Code
} from '@mui/icons-material';
import axios from 'axios';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeAnalysis = ({ selectedChunks, setLoading, handleNotification }) => {
  const { t } = useTranslation();
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeCode = async () => {
    if (selectedChunks.length === 0) {
      handleNotification(t('selectChunksToAnalyze'), 'warning');
      return;
    }

    setAnalyzing(true);
    setLoading(true);

    try {
      // Przygotuj dane do analizy
      const codeToAnalyze = selectedChunks.map(chunk => ({
        id: chunk.id,
        code: chunk.code,
        language: chunk.language
      }));

      // Wywołaj API analizy kodu
      const response = await axios.post('/api/analyze', { chunks: codeToAnalyze });
      
      setAnalysisResults(response.data);
      handleNotification(t('analysisComplete'), 'success');
    } catch (error) {
      console.error('Error analyzing code:', error);
      handleNotification(t('errorOccurred') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  // Funkcja pomocnicza do renderowania ikon na podstawie typu problemu
  const getIssueIcon = (issueType) => {
    switch (issueType) {
      case 'security':
        return <Security color="error" />;
      case 'performance':
        return <Speed color="warning" />;
      case 'maintainability':
        return <Build color="info" />;
      default:
        return <Info />;
    }
  };

  // Funkcja pomocnicza do renderowania poziomu ważności problemu
  const getSeverityChip = (severity) => {
    const color = severity === 'high' ? 'error' : 
                 severity === 'medium' ? 'warning' : 'info';
    
    return (
      <Chip 
        label={severity.toUpperCase()} 
        color={color} 
        size="small" 
        sx={{ ml: 1 }}
      />
    );
  };

  // Symulacja wyników analizy dla celów demonstracyjnych
  // W rzeczywistej implementacji te dane pochodziłyby z API
  const simulateAnalysis = () => {
    if (selectedChunks.length === 0) {
      handleNotification(t('selectChunksToAnalyze'), 'warning');
      return;
    }

    setAnalyzing(true);
    setLoading(true);

    // Symulacja opóźnienia odpowiedzi API
    setTimeout(() => {
      const simulatedResults = {
        overallScore: Math.floor(Math.random() * 40) + 60, // Losowy wynik 60-100
        metrics: {
          complexity: Math.floor(Math.random() * 40) + 60,
          maintainability: Math.floor(Math.random() * 40) + 60,
          security: Math.floor(Math.random() * 40) + 60,
          performance: Math.floor(Math.random() * 40) + 60
        },
        issues: [
          {
            id: 1,
            type: 'security',
            severity: 'high',
            description: 'Potencjalna podatność na wstrzyknięcie SQL',
            line: 12,
            suggestion: 'Użyj parametryzowanych zapytań zamiast konkatenacji stringów'
          },
          {
            id: 2,
            type: 'performance',
            severity: 'medium',
            description: 'Nieefektywna pętla z wielokrotnym wywołaniem funkcji',
            line: 24,
            suggestion: 'Przenieś wywołanie funkcji poza pętlę'
          },
          {
            id: 3,
            type: 'maintainability',
            severity: 'low',
            description: 'Zbyt długa funkcja, trudna w utrzymaniu',
            line: 8,
            suggestion: 'Podziel funkcję na mniejsze, bardziej specjalizowane funkcje'
          }
        ],
        suggestions: [
          'Dodaj komentarze dokumentacyjne do funkcji',
          'Rozważ użycie bardziej opisowych nazw zmiennych',
          'Dodaj obsługę błędów dla przypadków brzegowych'
        ]
      };

      setAnalysisResults(simulatedResults);
      handleNotification(t('analysisComplete'), 'success');
      setAnalyzing(false);
      setLoading(false);
    }, 2000);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('codeAnalysisTitle')}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {t('analyzeSelectedCode')}
        </Typography>
        
        {selectedChunks.length > 0 ? (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('selectedChunks')}: {selectedChunks.length}
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={simulateAnalysis} 
              disabled={analyzing}
              sx={{ mt: 2 }}
            >
              {analyzing ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  {t('analyzingCode')}
                </>
              ) : (
                t('analyzeCode')
              )}
            </Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('selectChunksToAnalyze')}
          </Alert>
        )}
      </Paper>

      {analysisResults && (
        <Grid container spacing={3}>
          {/* Ogólny wynik */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={t('codeQualityScore')} 
                subheader={`${analysisResults.overallScore}/100`}
              />
              <CardContent>
                <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={analysisResults.overallScore} 
                    size={120}
                    thickness={5}
                    color={
                      analysisResults.overallScore >= 80 ? "success" :
                      analysisResults.overallScore >= 60 ? "warning" : "error"
                    }
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%'
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary">
                      {analysisResults.overallScore}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Szczegółowe metryki */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title={t('codeMetrics')} />
              <CardContent>
                <Grid container spacing={2}>
                  {Object.entries(analysisResults.metrics).map(([metric, score]) => (
                    <Grid item xs={6} key={metric}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t(metric)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgressWithLabel 
                            value={score} 
                            color={
                              score >= 80 ? "success" :
                              score >= 60 ? "warning" : "error"
                            }
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Problemy */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={t('potentialIssues')} 
                subheader={`${analysisResults.issues.length} ${t('issuesFound')}`}
              />
              <Divider />
              <CardContent>
                <List>
                  {analysisResults.issues.map((issue) => (
                    <ListItem key={issue.id} alignItems="flex-start">
                      <ListItemIcon>
                        {getIssueIcon(issue.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {issue.description}
                            </Typography>
                            {getSeverityChip(issue.severity)}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {t('line')}: {issue.line}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              <strong>{t('suggestion')}:</strong> {issue.suggestion}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sugestie */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('improvementSuggestions')} />
              <Divider />
              <CardContent>
                <List>
                  {analysisResults.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

// Komponent pomocniczy do wyświetlania paska postępu z etykietą
function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

// Komponent LinearProgress nie jest importowany, więc tworzymy własny
function LinearProgress(props) {
  const { value, color } = props;
  
  return (
    <Box
      sx={{
        height: 10,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 5,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${value}%`,
          backgroundColor: 
            color === 'success' ? 'success.main' :
            color === 'warning' ? 'warning.main' : 'error.main',
          borderRadius: 5,
        }}
      />
    </Box>
  );
}

export default CodeAnalysis;
