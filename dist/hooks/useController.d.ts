import { Controller } from '../core/Controller';
import { Subject } from '../core/Subject';
export declare function useController<T extends Controller>(controller: T): T;
export declare function useSubject<T>(subject: Subject<T>): [T, (value: T) => void];
export declare function useControllerSubject<T extends Controller, K extends keyof T['subjects']>(controller: T, subjectKey: K): [any, (value: any) => void];
//# sourceMappingURL=useController.d.ts.map