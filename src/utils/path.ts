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

export async function selectFiles(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';

    input.onchange = () => {
      const files = input.files;
      if (files && files.length > 0) {
        // Filter for image files
        const imageFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/') || 
          file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
        );
        
        // Create a FileList-like object with only image files
        const filteredFiles = Object.create(FileList.prototype, {
          length: { value: imageFiles.length },
          item: { value: (index: number) => imageFiles[index] || null },
          [Symbol.iterator]: { value: function* () { yield* imageFiles; } },
          ...imageFiles.reduce((acc, file, index) => ({ ...acc, [index]: { value: file } }), {})
        });
        
        resolve(filteredFiles);
      } else {
        resolve(null);
      }
    };

    // Handle cancel
    input.oncancel = () => resolve(null);

    // Trigger file selection dialog
    input.click();
  });
}
