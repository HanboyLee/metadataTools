'use client';

import { useState } from 'react';
import { TextField, Box, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ApiKeyInputProps } from '../types';

export function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        type={showApiKey ? "text" : "password"}
        label="OpenAI API Key"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        margin="normal"
        variant="outlined"
        placeholder="Enter your OpenAI API key if not set in environment"
        helperText="API key can be configured in .env.local file"
        sx={{ mb: 2 }}
      />
      <IconButton
        aria-label="toggle api key visibility"
        onClick={() => setShowApiKey(!showApiKey)}
        sx={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'text.secondary'
        }}
      >
        {showApiKey ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Box>
  );
}
