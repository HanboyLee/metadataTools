'use server';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getDirectories, ensureDirectories } from '@/utils/directories';

interface ResetRequest {
  directories?: ('temp' | 'processed' | 'images')[];
}

async function clearDirectory(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          await clearDirectory(filePath);
          await fs.rmdir(filePath);
        } else {
          await fs.unlink(filePath);
        }
      } catch (error) {
        console.error(`Error removing ${filePath}:`, error);
      }
    }
    console.log(`Cleared directory: ${dir}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Error clearing directory ${dir}:`, error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get directory paths
    const dirs = await getDirectories();
    
    // 獲取要清理的目錄列表
    const body: ResetRequest = await request.json().catch(() => ({}));
    const directoriesToClear = body.directories || ['temp', 'processed', 'images'];
    
    // 建立目錄映射
    const dirMap = {
      'temp': dirs.TEMP_DIR,
      'processed': dirs.PROCESSED_DIR,
      'images': dirs.IMAGES_DIR
    };
    
    // 只清理指定的目錄
    await Promise.all(
      directoriesToClear.map(dir => clearDirectory(dirMap[dir]))
    );

    // 重新創建目錄
    await ensureDirectories();

    return NextResponse.json({ 
      message: `Directories cleared successfully: ${directoriesToClear.join(', ')}` 
    });
  } catch (error) {
    console.error('Failed to reset directories:', error);
    return NextResponse.json(
      { error: 'Failed to reset directories' },
      { status: 500 }
    );
  }
}
