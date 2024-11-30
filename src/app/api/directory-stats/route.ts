import { NextRequest, NextResponse } from 'next/server';
import { getDirectoryStats } from '@/utils/server/path';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        { 
          totalFiles: 0,
          imageFiles: 0,
          isValid: false,
          error: 'No path provided'
        },
        { status: 400 }
      );
    }

    const result = getDirectoryStats(path);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { 
        totalFiles: 0,
        imageFiles: 0,
        isValid: false,
        error: error.message || 'Failed to get directory statistics'
      },
      { status: 500 }
    );
  }
}
