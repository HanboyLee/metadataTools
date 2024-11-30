import * as fs from 'fs';
import * as path from 'path';

export function normalizePath(inputPath: string): string {
  // Remove quotes if they exist
  let cleanPath = inputPath.replace(/^["']|["']$/g, '');
  
  // Convert Windows-style paths to Unix-style
  cleanPath = cleanPath.replace(/\\/g, '/');
  
  return cleanPath;
}

export function validateDirectory(dirPath: string): { isValid: boolean; error?: string } {
  try {
    console.log('stats', dirPath);

    const normalizedPath = normalizePath(dirPath);
    
    // Check if path exists and is a directory
    const stats = fs.statSync(normalizedPath);
    
    if (!stats.isDirectory()) {
      return { isValid: false, error: 'The specified path is not a directory' };
    }

    // Check if directory is readable
    fs.accessSync(normalizedPath, fs.constants.R_OK);

    return { isValid: true };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { isValid: false, error: 'Directory does not exist' };
    }
    if (error.code === 'EACCES') {
      return { isValid: false, error: 'Permission denied: Cannot access directory' };
    }
    return { isValid: false, error: `Invalid directory: ${error.message}` };
  }
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

export function getDirectoryStats(dirPath: string) {
  try {
    const normalizedPath = normalizePath(dirPath);
    const files = fs.readdirSync(normalizedPath);
    const imageFiles = files.filter(file => isImageFile(file));
    
    return {
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      isValid: true
    };
  } catch {
    return {
      totalFiles: 0,
      imageFiles: 0,
      isValid: false
    };
  }
}
