import { Controller } from '../core/Controller';
export interface HomeViewModel {
    count: number;
    name: string;
    isLoading: boolean;
}
export interface HomeControllerInterface {
    viewModel: HomeViewModel;
    increment(): void;
    decrement(): void;
    updateName(name: string): void;
    setLoading(loading: boolean): void;
}
export interface HomeControllerRepository {
    fetchData(): Promise<void>;
    saveData(data: any): Promise<void>;
}
export declare class HomeController extends Controller implements HomeControllerInterface, HomeControllerRepository {
    private _countSubject;
    private _nameSubject;
    private _loadingSubject;
    constructor();
    get viewModel(): HomeViewModel;
    increment(): void;
    decrement(): void;
    updateName(name: string): void;
    setLoading(loading: boolean): void;
    fetchData(): Promise<void>;
    saveData(data: any): Promise<void>;
    onInit(): void;
    onDispose(): void;
}
//# sourceMappingURL=HomeController.d.ts.map