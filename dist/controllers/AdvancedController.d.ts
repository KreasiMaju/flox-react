import { Controller } from '../core/Controller';
import { Rx } from '../core/Rx';
export interface AdvancedControllerInterface {
    count: Rx<number>;
    name: Rx<string>;
    isLoading: Rx<boolean>;
    increment(): void;
    decrement(): void;
    updateName(name: string): void;
    startBackgroundTask(): void;
    showSnackbar(): void;
    showDialog(): void;
}
export declare class AdvancedController extends Controller implements AdvancedControllerInterface {
    count: Rx<number>;
    name: Rx<string>;
    isLoading: Rx<boolean>;
    constructor();
    increment(): void;
    decrement(): void;
    updateName(name: string): void;
    startBackgroundTask(): void;
    showSnackbar(): void;
    showDialog(): Promise<void>;
    onInit(): void;
    onDispose(): void;
}
//# sourceMappingURL=AdvancedController.d.ts.map