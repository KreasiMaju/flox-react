import { Binding } from './Binding';
import { Controller } from './Controller';
export declare class Flox {
    private static _instance;
    private _bindings;
    private _globalControllers;
    private constructor();
    /**
     * Singleton instance
     */
    static get instance(): Flox;
    /**
     * Put binding dengan key
     */
    putBinding(key: string, binding: Binding): void;
    /**
     * Mendapatkan binding berdasarkan key
     */
    getBinding(key: string): Binding | undefined;
    /**
     * Remove binding berdasarkan key
     */
    removeBinding(key: string): boolean;
    /**
     * Put global controller
     */
    putController<T extends Controller>(key: string, controller: T): T;
    /**
     * Mendapatkan global controller
     */
    getController<T extends Controller>(key: string): T | undefined;
    /**
     * Mendapatkan global controller atau throw error
     */
    findController<T extends Controller>(key: string): T;
    /**
     * Remove global controller
     */
    removeController(key: string): boolean;
    /**
     * Dispose semua bindings dan controllers
     */
    dispose(): void;
    /**
     * Mendapatkan semua bindings
     */
    get bindings(): Map<string, Binding>;
    /**
     * Mendapatkan semua global controllers
     */
    get globalControllers(): Map<string, Controller>;
}
export declare const flox: Flox;
//# sourceMappingURL=Flox.d.ts.map