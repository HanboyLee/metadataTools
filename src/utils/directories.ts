'use server';

import { promises as fs } from 'fs';
import path from 'path';

// Define directories as a function to avoid exporting constants
export async function getDirectories() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // 所有目錄都在 public 下
  const dirs = {
    IMAGES_DIR: path.join(publicDir, 'images'),
    PROCESSED_DIR: path.join(publicDir, 'processed'),
    TEMP_DIR: path.join(publicDir, 'temp'),
  };

  // 確保所有目錄存在
  await Promise.all(
    Object.values(dirs).map(dir => 
      fs.mkdir(dir, { recursive: true })
        .catch(error => {
          console.error(`Failed to create directory ${dir}:`, error);
          throw error;
        })
    )
  );

  return dirs;
}

// 確保目錄存在
export async function ensureDirectories() {
  const dirs = await getDirectories();
  console.log('Directories created successfully:', dirs);
}
