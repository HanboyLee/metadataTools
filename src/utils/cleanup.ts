'use server';

import { promises as fs } from 'fs';
import path from 'path';
import cron from 'node-cron';
import { getDirectories } from './directories';

// 從環境變量獲取配置
const CLEANUP_INTERVAL_MS = parseInt(process.env.CLEANUP_INTERVAL || '3600000'); // 1小時
const MAX_STORAGE_SIZE = parseInt(process.env.MAX_STORAGE_SIZE || '104857600'); // 100MB
const FILE_MAX_AGE = parseInt(process.env.FILE_MAX_AGE || '86400000'); // 24小時

interface FileMetadata {
  createdAt: number;
  lastAccessed: number;
  type: 'temp' | 'processed' | 'image';
}

let isCleanupRunning = false;
let fileUsageMap = new Map<string, number>();
let cronJob: cron.ScheduledTask | null = null;
let isInitialized = false;
let cachedDirs: Awaited<ReturnType<typeof getDirectories>> | null = null;

async function ensureDirs() {
  if (!cachedDirs) {
    cachedDirs = await getDirectories();
  }
  return cachedDirs;
}

async function getDirSize(dir: string): Promise<number> {
  if (typeof window !== 'undefined') return 0;

  try {
    const files = await fs.readdir(dir);
    const sizes = await Promise.all(
      files.map(async file => {
        const filePath = path.join(dir, file);
        try {
          const stats = await fs.stat(filePath);
          return stats.size;
        } catch {
          return 0;
        }
      })
    );
    return sizes.reduce((acc, size) => acc + size, 0);
  } catch (error) {
    console.error(`Failed to get directory size for ${dir}:`, error);
    return 0;
  }
}

async function getFilesByLastAccess(dir: string): Promise<Array<{ path: string; lastAccessed: number }>> {
  if (typeof window !== 'undefined') return [];

  try {
    const files = await fs.readdir(dir);
    const fileInfos = await Promise.all(
      files.map(async file => {
        const filePath = path.join(dir, file);
        if (filePath.endsWith('.meta')) return null;

        const metaPath = `${filePath}.meta`;
        try {
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          const metadata: FileMetadata = JSON.parse(metaContent);
          return { path: filePath, lastAccessed: metadata.lastAccessed };
        } catch {
          return { path: filePath, lastAccessed: 0 };
        }
      })
    );

    return fileInfos.filter((info): info is { path: string; lastAccessed: number } => 
      info !== null
    );
  } catch (error) {
    console.error(`Failed to get files by last access for ${dir}:`, error);
    return [];
  }
}

async function performInitialCleanup(): Promise<void> {
  if (typeof window !== 'undefined' || isCleanupRunning) return;
  isCleanupRunning = true;

  try {
    console.log('Starting initial cleanup...');
    
    // 獲取並緩存目錄路徑
    const dirs = await ensureDirs();

    // 清理所有目錄
    const directories = [
      { path: dirs.TEMP_DIR, type: 'temp' as const },
      { path: dirs.PROCESSED_DIR, type: 'processed' as const },
      { path: dirs.IMAGES_DIR, type: 'image' as const }
    ];

    for (const { path: dir, type } of directories) {
      try {
        const files = await fs.readdir(dir);
        console.log(`Checking ${type} directory: ${dir} (${files.length} files)`);

        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const stats = await fs.stat(filePath);
            const metaPath = `${filePath}.meta`;
            
            try {
              const metaContent = await fs.readFile(metaPath, 'utf-8');
              const metadata: FileMetadata = JSON.parse(metaContent);
              
              const age = Date.now() - metadata.createdAt;
              const isExpired = age > FILE_MAX_AGE;
              const isInUse = fileUsageMap.has(filePath);
              
              if (isExpired && !isInUse) {
                await fs.unlink(filePath);
                await fs.unlink(metaPath).catch(() => {});
                console.log(`Cleaned up expired ${type} file: ${filePath} (age: ${age}ms)`);
              }
            } catch {
              // 如果沒有元數據文件或讀取失敗，檢查文件年齡
              const age = Date.now() - stats.birthtimeMs;
              if (age > FILE_MAX_AGE) {
                await fs.unlink(filePath);
                console.log(`Cleaned up old ${type} file without metadata: ${filePath} (age: ${age}ms)`);
              }
            }
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    }
  } catch (error) {
    console.error('Initial cleanup failed:', error);
  } finally {
    isCleanupRunning = false;
  }
}

async function performCleanup(): Promise<void> {
  if (typeof window !== 'undefined' || isCleanupRunning) return;
  isCleanupRunning = true;

  try {
    console.log('Performing scheduled cleanup...');
    
    // 獲取並緩存目錄路徑
    const dirs = await ensureDirs();

    // 檢查並清理過期文件
    await performInitialCleanup();
    
    // 檢查存儲空間限制
    const tempDirSize = await getDirSize(dirs.TEMP_DIR);
    const processedDirSize = await getDirSize(dirs.PROCESSED_DIR);
    const imagesDirSize = await getDirSize(dirs.IMAGES_DIR);
    const totalSize = tempDirSize + processedDirSize + imagesDirSize;

    console.log('Current storage usage:', {
      temp: `${(tempDirSize / 1024 / 1024).toFixed(2)}MB`,
      processed: `${(processedDirSize / 1024 / 1024).toFixed(2)}MB`,
      images: `${(imagesDirSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(MAX_STORAGE_SIZE / 1024 / 1024).toFixed(2)}MB`
    });

    if (totalSize > MAX_STORAGE_SIZE) {
      // 獲取所有目錄的文件
      const tempFiles = await getFilesByLastAccess(dirs.TEMP_DIR);
      const processedFiles = await getFilesByLastAccess(dirs.PROCESSED_DIR);
      const imageFiles = await getFilesByLastAccess(dirs.IMAGES_DIR);
      
      // 按最後訪問時間排序所有文件
      const allFiles = [...tempFiles, ...processedFiles, ...imageFiles]
        .sort((a, b) => a.lastAccessed - b.lastAccessed);

      console.log(`Found ${allFiles.length} files to consider for cleanup`);

      for (const file of allFiles) {
        if (fileUsageMap.has(file.path)) {
          console.log(`Skipping active file: ${file.path}`);
          continue;
        }

        try {
          await fs.unlink(file.path);
          await fs.unlink(`${file.path}.meta`).catch(() => {});
          console.log(`Cleaned up file due to space limit: ${file.path}`);

          const newTotalSize = await getDirSize(dirs.TEMP_DIR) + 
                             await getDirSize(dirs.PROCESSED_DIR) +
                             await getDirSize(dirs.IMAGES_DIR);
          
          console.log(`New total size: ${(newTotalSize / 1024 / 1024).toFixed(2)}MB`);
          
          if (newTotalSize <= MAX_STORAGE_SIZE) {
            console.log('Storage size is now within limits');
            break;
          }
        } catch (error) {
          console.error(`Error deleting file ${file.path}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Scheduled cleanup failed:', error);
  } finally {
    isCleanupRunning = false;
  }
}

async function initialize(): Promise<void> {
  if (typeof window !== 'undefined' || isInitialized) return;

  try {
    // 獲取並緩存目錄路徑
    const dirs = await ensureDirs();
    
    // 啟動時執行一次清理
    await performInitialCleanup();

    // 設置定時清理
    if (!cronJob) {
      cronJob = cron.schedule('*/60 * * * *', async () => {
        console.log('Running scheduled cleanup...');
        await performCleanup();
      });
    }

    isInitialized = true;
    console.log('Cleanup service initialized with directories:', dirs);
  } catch (error) {
    console.error('Failed to initialize cleanup service:', error);
    throw error;
  }
}

async function registerFile(filePath: string): Promise<void> {
  if (typeof window !== 'undefined') return;

  const dirs = await ensureDirs();
  const now = Date.now();
  const count = (fileUsageMap.get(filePath) || 0) + 1;
  fileUsageMap.set(filePath, count);

  // 確定文件類型
  const type: FileMetadata['type'] = 
    filePath.startsWith(dirs.TEMP_DIR) ? 'temp' :
    filePath.startsWith(dirs.PROCESSED_DIR) ? 'processed' :
    filePath.startsWith(dirs.IMAGES_DIR) ? 'image' : 'temp';

  // 創建或更新元數據文件
  const metadata: FileMetadata = {
    createdAt: now,
    lastAccessed: now,
    type
  };

  try {
    await fs.writeFile(
      `${filePath}.meta`,
      JSON.stringify(metadata),
      'utf-8'
    );
  } catch (error) {
    console.error(`Failed to write metadata for ${filePath}:`, error);
  }
}

async function unregisterFile(filePath: string): Promise<void> {
  if (typeof window !== 'undefined') return;

  const count = fileUsageMap.get(filePath);
  if (count === undefined) return;

  if (count <= 1) {
    fileUsageMap.delete(filePath);
  } else {
    fileUsageMap.set(filePath, count - 1);
  }

  try {
    const metaPath = `${filePath}.meta`;
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const metadata: FileMetadata = JSON.parse(metaContent);
    metadata.lastAccessed = Date.now();
    await fs.writeFile(metaPath, JSON.stringify(metadata), 'utf-8');
  } catch (error) {
    console.error(`Failed to update metadata for ${filePath}:`, error);
  }
}

async function getStats(): Promise<{
  tempDirSize: number;
  processedDirSize: number;
  imagesDirSize: number;
  activeFiles: number;
}> {
  if (typeof window !== 'undefined') {
    return {
      tempDirSize: 0,
      processedDirSize: 0,
      imagesDirSize: 0,
      activeFiles: 0
    };
  }

  const dirs = await ensureDirs();
  const tempDirSize = await getDirSize(dirs.TEMP_DIR);
  const processedDirSize = await getDirSize(dirs.PROCESSED_DIR);
  const imagesDirSize = await getDirSize(dirs.IMAGES_DIR);
  return {
    tempDirSize,
    processedDirSize,
    imagesDirSize,
    activeFiles: fileUsageMap.size
  };
}

export { initialize, registerFile, unregisterFile, getStats };
