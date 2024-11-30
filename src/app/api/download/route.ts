import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define directories
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const PROCESSED_DIR = path.join(process.cwd(), 'public', 'processed');
const TEMP_DIR = path.join(process.cwd(), 'public', 'temp');

// Clean up temporary files and directories
async function cleanupTempFiles() {
  try {
    // Remove all temporary directories
    await fs.rm(IMAGES_DIR, { recursive: true, force: true });
    await fs.rm(PROCESSED_DIR, { recursive: true, force: true });
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    
    // Recreate empty directories to ensure they exist for next upload
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.mkdir(PROCESSED_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
    
    console.log('Cleaned up all temporary files and directories');
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { zipPath } = await request.json();
    if (!zipPath) {
      return NextResponse.json({ error: 'No ZIP path provided' }, { status: 400 });
    }

    // Schedule cleanup after a short delay to ensure download has started
    setTimeout(cleanupTempFiles, 5000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Error processing download request' },
      { status: 500 }
    );
  }
}
