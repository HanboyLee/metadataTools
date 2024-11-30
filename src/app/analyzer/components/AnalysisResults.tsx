'use client';

import { Box, Typography, Paper, Alert } from '@mui/material';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  results: Record<string, AnalysisResult | null>;
  errors: Record<string, string | undefined>;
}

export function AnalysisResults({ results, errors }: AnalysisResultsProps) {
  return (
    <Box sx={{ mt: 3 }}>
      {Object.entries(results).map(([filename, result]) => (
        <Paper key={filename} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {filename}
          </Typography>
          
          {result ? (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Title:</strong> {result.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {result.description}
              </Typography>
              <Typography variant="body1">
                <strong>Keywords:</strong> {result.keywords}
              </Typography>
            </>
          ) : errors[filename] ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errors[filename]}
            </Alert>
          ) : null}
        </Paper>
      ))}
    </Box>
  );
}
