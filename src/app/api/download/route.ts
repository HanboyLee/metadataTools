import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define directories
const TEMP_DIR = path.join(process.cwd(), 'public', 'temp');

// Function to clean up temp files
async function cleanupTempFiles() {
  try {
    const files = await fs.readdir(TEMP_DIR);
    for (const file of files) {
      if (file.endsWith('.zip')) {
        await fs.unlink(path.join(TEMP_DIR, file));
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
}

// Handle POST request for cleanup
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

// Handle GET request for file download
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filePath = path.join(TEMP_DIR, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file content
    const fileContent = await fs.readFile(filePath);

    // Create response with appropriate headers
    const response = new NextResponse(fileContent);
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Error downloading file' },
      { status: 500 }
    );
  }
}
