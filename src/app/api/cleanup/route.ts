import { NextResponse } from 'next/server';
import { cleanupService } from '@/utils/cleanup';

// 初始化清理服務
await cleanupService.initialize();

export async function GET() {
  return NextResponse.json({ message: 'Cleanup service initialized' });
}
