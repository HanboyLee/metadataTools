'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Paper, Typography, CircularProgress, Box } from '@mui/material';
import { ApiKeyInput } from './components/ApiKeyInput';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeImage } from './services/openai';
import { exportToCsv } from './utils/csv';
import { ImageAnalysisState } from './types';

export default function ImageAnalyzer() {
  const [state, setState] = useState<ImageAnalysisState>({
    selectedFiles: [],
    analyzing: false,
    results: {},
    errors: {},
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  });

  // Update apiKey if environment variable changes
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setState(prev => ({ ...prev, apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '' }));
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setState(prev => ({
        ...prev,
        selectedFiles: Array.from(files),
        results: {},
        errors: {}
      }));
    }
  };

  const handleAnalyze = async () => {
    if (!state.apiKey) {
      alert('Please enter your OpenAI API key');
      return;
    }

    if (!state.apiKey.startsWith('sk-')) {
      alert('Invalid OpenAI API key format');
      return;
    }

    setState(prev => ({ ...prev, analyzing: true }));

    for (const file of state.selectedFiles) {
      try {
        console.log(`Analyzing ${file.name}...`);
        const result = await analyzeImage(file, state.apiKey);
        setState(prev => ({
          ...prev,
          results: { ...prev.results, [file.name]: result },
          errors: { ...prev.errors, [file.name]: undefined }
        }));
      } catch (error: any) {
        console.error(`Error analyzing ${file.name}:`, error);
        setState(prev => ({
          ...prev,
          results: { ...prev.results, [file.name]: null },
          errors: { ...prev.errors, [file.name]: error.message }
        }));
      }
    }

    setState(prev => ({ ...prev, analyzing: false }));
  };

  const handleExportCsv = () => {
    try {
      exportToCsv(state.results);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Image Analyzer
        </Typography>

        <ApiKeyInput 
          apiKey={state.apiKey}
          onApiKeyChange={(value) => setState(prev => ({ ...prev, apiKey: value }))}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            multiple
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span">
              Choose Images
            </Button>
          </label>
          
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={state.analyzing || state.selectedFiles.length === 0}
          >
            {state.analyzing ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Analyzing...
              </>
            ) : (
              'Analyze Images'
            )}
          </Button>

          <Button
            variant="outlined"
            onClick={handleExportCsv}
            disabled={Object.keys(state.results).length === 0}
          >
            Export to CSV
          </Button>
        </Box>

        {state.selectedFiles.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Selected {state.selectedFiles.length} file(s)
          </Typography>
        )}

        <AnalysisResults 
          results={state.results}
          errors={state.errors}
        />
      </Paper>
    </Container>
  );
}
