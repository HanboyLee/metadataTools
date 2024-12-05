import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { registerFile, unregisterFile } from '@/utils/cleanup';

// Define directories
const TEMP_DIR = path.join(process.cwd(), 'public', 'temp');

// 清理指定的臨時文件
async function cleanupTempFile(zipPath: string) {
  try {
    if (await fs.stat(zipPath).catch(() => null)) {
      await fs.unlink(zipPath);
      console.log(`Cleaned up temp file: ${zipPath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up temp file ${zipPath}:`, error);
  }
}

// Handle POST request for cleanup
export async function POST(request: NextRequest) {
  try {
    const { zipPath } = await request.json();
    if (!zipPath) {
      return NextResponse.json({ error: 'No ZIP path provided' }, { status: 400 });
    }

    const fullPath = path.join(TEMP_DIR, path.basename(zipPath));
    
    // 取消註冊文件（表示下載完成）
    await unregisterFile(fullPath);
    
    // 延遲30秒後清理文件，給予足夠的下載時間
    setTimeout(() => cleanupTempFile(fullPath), 30000);

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
  const filename = params.filename;
  const filePath = path.join(TEMP_DIR, filename);

  try {
    // 檢查文件是否存在
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 註冊文件為正在使用（防止被自動清理）
    await registerFile(filePath);

    // 讀取文件
    const file = await fs.readFile(filePath);

    // 設置響應頭
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename=${filename}`);
    headers.set('Content-Length', stat.size.toString());

    return new NextResponse(file, { headers });
  } catch (error) {
    console.error(`Error serving file ${filename}:`, error);
    return NextResponse.json(
      { error: 'Error serving file' },
      { status: 500 }
    );
  }
}
