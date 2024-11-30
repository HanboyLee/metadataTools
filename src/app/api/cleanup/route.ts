import { NextResponse } from 'next/server';
import { initialize } from '@/utils/cleanup';

// 初始化清理服務
await initialize();

export async function GET() {
  return NextResponse.json({ message: 'Cleanup service initialized' });
}
