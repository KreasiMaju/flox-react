import { Controller } from './Controller';
import { Binding } from './Binding';
export declare class FloxUtils {
    static put<T extends Controller>(key: string, controller: T): T;
    static find<T extends Controller>(key: string): T;
    static delete(key: string): boolean;
    static putBinding(key: string, binding: Binding): void;
    static findBinding(key: string): Binding | undefined;
    static deleteBinding(key: string): boolean;
    static isRegistered(key: string): boolean;
    static isBindingRegistered(key: string): boolean;
    static snackbar(message: string, duration?: number): void;
    static dialog(title: string, content: string): Promise<boolean>;
    static loading(message?: string): void;
    static closeLoading(): void;
}
//# sourceMappingURL=Get.d.ts.map