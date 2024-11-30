'use client';

import { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { selectFiles } from '@/utils/path';

interface DirectoryInputProps {
  onFilesSelected: (files: FileList) => void;
}

export function DirectoryInput({ onFilesSelected }: DirectoryInputProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const handleSelectFiles = async () => {
    setIsSelecting(true);
    setError(null);

    try {
      const files = await selectFiles();
      if (files && files.length > 0) {
        setSelectedCount(files.length);
        onFilesSelected(files);
      } else {
        setError('No image files selected');
      }
    } catch (err) {
      setError('Failed to select files. Please try again.');
      console.error('File selection error:', err);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          label="Selected Images"
          value={selectedCount ? `${selectedCount} images selected` : ''}
          disabled
          helperText="Click 'Select Images' to choose image files"
        />
        <Button
          variant="contained"
          onClick={handleSelectFiles}
          disabled={isSelecting}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {isSelecting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Selecting...
            </>
          ) : (
            'Select Images'
          )}
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
