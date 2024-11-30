"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const metadata_1 = require("../utils/metadata");
if (!worker_threads_1.parentPort) {
    throw new Error('This module must be run as a worker thread!');
}
worker_threads_1.parentPort.on('message', async (message) => {
    const { type, data } = message;
    if (type === 'PROCESS_IMAGE') {
        try {
            const { imageFile, metadata } = data;
            const result = await (0, metadata_1.processMetadataFile)(imageFile, metadata);
            // 發送成功消息回主線程
            worker_threads_1.parentPort.postMessage({
                type: 'SUCCESS',
                data: {
                    filename: imageFile.name,
                    result
                }
            });
        }
        catch (error) {
            // 發送錯誤消息回主線程
            worker_threads_1.parentPort.postMessage({
                type: 'ERROR',
                data: {
                    filename: data.imageFile.name,
                    error: error instanceof Error ? error.message : String(error)
                }
            });
        }
    }
});
