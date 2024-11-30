import { Worker } from 'worker_threads';
import path from 'path';

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    task: any;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  private activeWorkers = 0;

  constructor(private workerScript: string, private poolSize: number = 4) {
    // 初始化 worker 池
    for (let i = 0; i < poolSize; i++) {
      const workerPath = path.join(process.cwd(), 'dist', 'workers', 'metadata.worker.js');
      this.workers.push(new Worker(workerPath));
    }
  }

  async execute(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 如果有空閒的 worker，直接執行任務
      if (this.activeWorkers < this.workers.length) {
        this.runTask(task, resolve, reject);
      } else {
        // 否則將任務加入隊列
        this.queue.push({ task, resolve, reject });
      }
    });
  }

  private runTask(task: any, resolve: (value: any) => void, reject: (reason?: any) => void) {
    const workerIndex = this.workers.findIndex((worker) => 
      !worker.listenerCount('message') && !worker.listenerCount('error')
    );

    if (workerIndex === -1) {
      this.queue.push({ task, resolve, reject });
      return;
    }

    const worker = this.workers[workerIndex];
    this.activeWorkers++;

    worker.on('message', (result) => {
      this.activeWorkers--;
      worker.removeAllListeners();

      if (result.type === 'ERROR') {
        reject(result.data.error);
      } else {
        resolve(result.data);
      }

      // 處理隊列中的下一個任務
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift()!;
        this.runTask(nextTask.task, nextTask.resolve, nextTask.reject);
      }
    });

    worker.on('error', (error) => {
      this.activeWorkers--;
      worker.removeAllListeners();
      reject(error);

      if (this.queue.length > 0) {
        const nextTask = this.queue.shift()!;
        this.runTask(nextTask.task, nextTask.resolve, nextTask.reject);
      }
    });

    worker.postMessage(task);
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
  }
}
