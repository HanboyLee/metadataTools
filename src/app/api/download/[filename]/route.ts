import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { initialize, registerFile, unregisterFile } from '@/utils/cleanup';

const TEMP_DIR = process.env.TEMP_DIR || '/tmp/uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Initialize cleanup service
    await initialize();
    
    const filename = params.filename;
    const filePath = path.join(TEMP_DIR, filename);

    await registerFile(filePath);

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

    await unregisterFile(filePath);

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Error downloading file' },
      { status: 500 }
    );
  }
}
