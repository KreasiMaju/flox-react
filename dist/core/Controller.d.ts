import { Subject } from './Subject';
export declare abstract class Controller {
    private _subjects;
    private _isDisposed;
    /**
     * Membuat reactive subject untuk state
     */
    protected createSubject<T>(key: string, initialValue: T): Subject<T>;
    /**
     * Mendapatkan subject berdasarkan key
     */
    protected getSubject<T>(key: string): Subject<T> | undefined;
    /**
     * Public method untuk mendapatkan subject
     */
    getSubjectPublic<T>(key: string): Subject<T> | undefined;
    /**
     * Update nilai subject
     */
    protected updateSubject<T>(key: string, value: T): void;
    /**
     * Lifecycle method - dipanggil saat controller diinisialisasi
     */
    onInit(): void;
    /**
     * Lifecycle method - dipanggil saat controller akan dihapus
     */
    onDispose(): void;
    /**
     * Check apakah controller sudah di-dispose
     */
    get isDisposed(): boolean;
    /**
     * Mendapatkan semua subjects
     */
    get subjects(): Map<string, Subject<any>>;
}
//# sourceMappingURL=Controller.d.ts.map