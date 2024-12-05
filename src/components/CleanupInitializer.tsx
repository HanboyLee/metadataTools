'use client';

import { useEffect } from 'react';
import { initialize } from '@/utils/cleanup';

export function CleanupInitializer() {
  useEffect(() => {
    // 初始化清理服務
    initialize().catch(error => {
      console.error('Failed to initialize cleanup service:', error);
    });

    // 在頁面卸載前清理
    const handleBeforeUnload = async () => {
      try {
        const response = await fetch("/api/reset", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            directories: ['processed', 'temp'] 
          }),
          // 確保請求在頁面卸載前完成
          keepalive: true
        });

        if (!response.ok) {
          console.warn("Failed to cleanup directories before unload");
        }
      } catch (error) {
        console.error("Error cleaning up directories before unload:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
