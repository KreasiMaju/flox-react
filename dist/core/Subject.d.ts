export type Observer<T> = (value: T) => void;
export declare class Subject<T> {
    private _value;
    private _observers;
    private _isDisposed;
    constructor(initialValue: T);
    /**
     * Mendapatkan nilai saat ini
     */
    get value(): T;
    /**
     * Subscribe ke perubahan nilai
     */
    subscribe(observer: Observer<T>): () => void;
    /**
     * Update nilai dan notify semua observers
     */
    next(value: T): void;
    /**
     * Update nilai tanpa notify observers (untuk internal use)
     */
    setValue(value: T): void;
    /**
     * Dispose subject
     */
    dispose(): void;
    /**
     * Check apakah subject sudah di-dispose
     */
    get isDisposed(): boolean;
    /**
     * Jumlah observers yang aktif
     */
    get observerCount(): number;
}
//# sourceMappingURL=Subject.d.ts.map