import { parentPort } from 'worker_threads';
import { processMetadataFile } from '../utils/metadata';

interface WorkerMessage {
  type: 'PROCESS_IMAGE';
  data: {
    imageFile: File;
    metadata: {
      title: string;
      description: string;
      keywords: string;
    };
  };
}

if (!parentPort) {
  throw new Error('This module must be run as a worker thread!');
}

parentPort.on('message', async (message: WorkerMessage) => {
  const { type, data } = message;

  if (type === 'PROCESS_IMAGE') {
    try {
      const { imageFile, metadata } = data;
      const result = await processMetadataFile(imageFile, metadata);
      
      // 發送成功消息回主線程
      parentPort.postMessage({
        type: 'SUCCESS',
        data: {
          filename: imageFile.name,
          result
        }
      });
    } catch (error) {
      // 發送錯誤消息回主線程
      parentPort.postMessage({
        type: 'ERROR',
        data: {
          filename: data.imageFile.name,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }
});

export {};
