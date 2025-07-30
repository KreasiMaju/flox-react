import { Binding } from '../core/Binding';
import { Controller } from '../core/Controller';
export declare function useBinding(key: string, binding: Binding): Binding;
export declare function useControllerFromBinding<T extends Controller>(binding: Binding, controllerKey: string): T;
export declare function useGlobalController<T extends Controller>(key: string, controller: T): T;
//# sourceMappingURL=useBinding.d.ts.map