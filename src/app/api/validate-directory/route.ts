import { NextRequest, NextResponse } from 'next/server';
import { validateDirectory } from '@/utils/server/path';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        { isValid: false, error: 'No path provided' },
        { status: 400 }
      );
    }

    const result = validateDirectory(path);
    console.log(result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { isValid: false, error: error.message || 'Failed to validate directory' },
      { status: 500 }
    );
  }
}
