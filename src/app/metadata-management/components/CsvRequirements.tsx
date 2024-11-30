import { Box, Typography } from '@mui/material';
import { CsvRequirementsProps } from '../types';

export function CsvRequirements({ sx }: CsvRequirementsProps) {
  return (
    <Box sx={{ mt: 2, ...sx }}>
      <Typography variant="subtitle1" gutterBottom>
        CSV Format Requirements:
      </Typography>
      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
        <Typography variant="body2" component="div">
          <strong>Headers (in exact order):</strong>
          <Box component="code" sx={{ display: 'block', ml: 2, mt: 1 }}>
            FileName,Title,Description,Keywords
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <strong>Requirements:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li>CSV must use comma (,) as delimiter</li>
              <li>Headers must be exactly as shown above</li>
              <li>FileName must match your image file name</li>
              <li>Keywords should be comma-separated</li>
            </ul>
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
