import { Controller } from '../core/Controller';
export interface AppControllerInterface {
    theme: string;
    language: string;
    setTheme(theme: string): void;
    setLanguage(language: string): void;
}
export declare class AppController extends Controller implements AppControllerInterface {
    private _themeSubject;
    private _languageSubject;
    get theme(): string;
    get language(): string;
    setTheme(theme: string): void;
    setLanguage(language: string): void;
    onInit(): void;
    onDispose(): void;
}
//# sourceMappingURL=AppController.d.ts.map