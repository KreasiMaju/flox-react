import { Controller } from './Controller';
export interface BindingInterface {
    dependencies(): void;
}
export declare abstract class Binding implements BindingInterface {
    private _controllers;
    private _fenixControllers;
    private _permanentControllers;
    private _lazyFactories;
    private _isInitialized;
    /**
     * Register controller dengan key
     */
    protected putController<T extends Controller>(key: string, controller: T): T;
    /**
     * Register controller sebagai Fenix (recreate setiap kali dibutuhkan)
     */
    protected putFenix<T extends Controller>(key: string, controllerFactory: () => T): void;
    /**
     * Register controller sebagai Permanent (tidak pernah di-dispose)
     */
    protected putPermanent<T extends Controller>(key: string, controller: T): T;
    /**
     * Lazy Put - controller hanya dibuat saat pertama kali diakses
     */
    protected lazyPut<T extends Controller>(key: string, controllerFactory: () => T): void;
    /**
     * Mendapatkan controller berdasarkan key
     */
    protected getController<T extends Controller>(key: string): T | undefined;
    /**
     * Public method untuk mendapatkan controller
     */
    getControllerPublic<T extends Controller>(key: string): T | undefined;
    /**
     * Mendapatkan controller atau throw error jika tidak ditemukan
     */
    protected findController<T extends Controller>(key: string): T;
    /**
     * Remove controller berdasarkan key
     */
    protected removeController(key: string): boolean;
    /**
     * Get Fenix controller (recreate jika perlu)
     */
    protected getFenix<T extends Controller>(key: string, controllerFactory: () => T): T;
    /**
     * Initialize binding dan semua controllers
     */
    initialize(): void;
    /**
     * Dispose binding dan semua controllers (kecuali permanent)
     */
    dispose(): void;
    /**
     * Check apakah binding sudah di-initialize
     */
    get isInitialized(): boolean;
    /**
     * Mendapatkan semua controllers
     */
    get controllers(): Map<string, Controller>;
    /**
     * Abstract method yang harus diimplementasikan untuk mendefinisikan dependencies
     */
    abstract dependencies(): void;
}
//# sourceMappingURL=Binding.d.ts.map