import { Controller } from '../core/Controller';

export interface AppControllerInterface {
  theme: string;
  language: string;
  setTheme(theme: string): void;
  setLanguage(language: string): void;
}

export class AppController extends Controller implements AppControllerInterface {
  private _themeSubject = this.createSubject('theme', 'light');
  private _languageSubject = this.createSubject('language', 'en');

  get theme(): string {
    return this._themeSubject.value;
  }

  get language(): string {
    return this._languageSubject.value;
  }

  setTheme(theme: string): void {
    this._themeSubject.next(theme);
  }

  setLanguage(language: string): void {
    this._languageSubject.next(language);
  }

  onInit(): void {
    console.log('AppController initialized (Permanent)');
  }

  onDispose(): void {
    console.log('AppController disposed (Permanent)');
    super.onDispose();
  }
} 