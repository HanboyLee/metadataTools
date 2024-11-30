'use server';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getDirectories, ensureDirectories } from '@/utils/directories';

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
    
    // 清除所有目錄
    await Promise.all([
      clearDirectory(dirs.TEMP_DIR),
      clearDirectory(dirs.PROCESSED_DIR),
      clearDirectory(dirs.IMAGES_DIR)
    ]);

    // 重新創建目錄
    await ensureDirectories();

    return NextResponse.json({ message: 'All directories cleared successfully' });
  } catch (error) {
    console.error('Failed to reset directories:', error);
    return NextResponse.json(
      { error: 'Failed to reset directories' },
      { status: 500 }
    );
  }
}
