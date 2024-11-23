import path from 'path';

// Base paths
const BASE_DIR = process.cwd();
const UPLOADS_DIR = path.join(BASE_DIR, 'uploads');
const TEMP_DIR = path.join(BASE_DIR, 'temp');

// Ensure these directories exist
import { promises as fs } from 'fs';
(async () => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
})();

export const paths = {
  // CSV file handling
  csvTemp: path.join(TEMP_DIR, 'metadata.csv'),
  uploadsDir: UPLOADS_DIR,
  
  // Image directories
  imagesDir: '/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/test 3', // Keep the current image directory for now
  
  // Utility function to get paths
  getUploadPath: (filename: string) => path.join(UPLOADS_DIR, filename),
  getTempPath: (filename: string) => path.join(TEMP_DIR, filename),
} as const;
