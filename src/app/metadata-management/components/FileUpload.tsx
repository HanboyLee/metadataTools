import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileUploadProps } from '../types';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function FileUpload({ csvFile, onFileChange }: FileUploadProps) {
  return (
    <>
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        sx={{ width: '100%', height: '100px' }}
      >
        Select CSV File
        <VisuallyHiddenInput
          type="file"
          accept=".csv"
          required
          onChange={onFileChange}
        />
      </Button>
      {csvFile && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selected file: {csvFile.name}
          </Typography>
        </Box>
      )}
    </>
  );
}
