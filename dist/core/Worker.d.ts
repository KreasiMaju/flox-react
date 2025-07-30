export declare class BackgroundWorker {
    private static _workers;
    static create(key: string, task: () => void | Promise<void>): void;
    static start(key: string): void;
    static stop(key: string): void;
    static delete(key: string): boolean;
    static isRunning(key: string): boolean;
}
//# sourceMappingURL=Worker.d.ts.map