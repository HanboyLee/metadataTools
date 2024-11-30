export function normalizePath(inputPath: string): string {
  // Remove quotes if they exist
  let cleanPath = inputPath.replace(/^["']|["']$/g, '');
  
  // Convert Windows-style paths to Unix-style
  cleanPath = cleanPath.replace(/\\/g, '/');
  
  return cleanPath;
}

let directoryHandle: FileSystemDirectoryHandle | null = null;

export async function selectDirectory(): Promise<{ path: string; handle: FileSystemDirectoryHandle } | null> {
  try {
    // Show directory picker
    directoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite'  // Need write permission for metadata updates
    });
    
    // Get directory path (this will be a display name)
    const path = directoryHandle.name;
    
    return {
      path,
      handle: directoryHandle
    };
  } catch (error) {
    console.error('Error selecting directory:', error);
    return null;
  }
}

export async function validateDirectory(dirPath: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    if (!directoryHandle) {
      return { isValid: false, error: 'No directory selected. Please select a directory first.' };
    }

    // Verify we still have permission
    const permissionStatus = await directoryHandle.queryPermission({ mode: 'readwrite' });
    if (permissionStatus !== 'granted') {
      // Request permission again if needed
      const newPermission = await directoryHandle.requestPermission({ mode: 'readwrite' });
      if (newPermission !== 'granted') {
        return { isValid: false, error: 'Permission to access directory was denied.' };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Failed to validate directory' };
  }
}

export async function getDirectoryContents(): Promise<string[]> {
  if (!directoryHandle) {
    throw new Error('No directory selected');
  }

  const files: string[] = [];
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      files.push(entry.name);
    }
  }
  return files;
}

export async function readFile(fileName: string): Promise<File | null> {
  if (!directoryHandle) {
    throw new Error('No directory selected');
  }

  try {
    const fileHandle = await directoryHandle.getFileHandle(fileName);
    return await fileHandle.getFile();
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

export async function getImageFiles(): Promise<{ name: string; file: File }[]> {
  if (!directoryHandle) {
    throw new Error('No directory selected');
  }

  const imageFiles: { name: string; file: File }[] = [];
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file' && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      try {
        const fileHandle = await directoryHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        imageFiles.push({ 
          name: entry.name.toLowerCase(), // Store lowercase name for case-insensitive comparison
          file 
        });
      } catch (error) {
        console.error(`Error reading file ${entry.name}:`, error);
      }
    }
  }
  return imageFiles;
}

export function getCurrentDirectoryHandle(): FileSystemDirectoryHandle | null {
  return directoryHandle;
}
