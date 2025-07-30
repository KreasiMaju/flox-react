export class BackgroundWorker {
  private static _workers: Map<string, any> = new Map();

  static create(key: string, task: () => void | Promise<void>): void {
    // Simple implementation using setTimeout
    const worker = {
      task,
      isRunning: false,
      start: () => {
        if (!worker.isRunning) {
          worker.isRunning = true;
          setTimeout(async () => {
            try {
              await worker.task();
            } catch (error) {
              console.error('Worker error:', error);
            } finally {
              worker.isRunning = false;
            }
          }, 0);
        }
      },
      stop: () => {
        worker.isRunning = false;
      }
    };

    this._workers.set(key, worker);
  }

  static start(key: string): void {
    const worker = this._workers.get(key);
    if (worker) {
      worker.start();
    }
  }

  static stop(key: string): void {
    const worker = this._workers.get(key);
    if (worker) {
      worker.stop();
    }
  }

  static delete(key: string): boolean {
    const worker = this._workers.get(key);
    if (worker) {
      worker.stop();
      return this._workers.delete(key);
    }
    return false;
  }

  static isRunning(key: string): boolean {
    const worker = this._workers.get(key);
    return worker ? worker.isRunning : false;
  }
} 