import { Controller } from '../core/Controller';

export interface SettingsControllerInterface {
  notifications: boolean;
  autoSave: boolean;
  toggleNotifications(): void;
  toggleAutoSave(): void;
}

export class SettingsController extends Controller implements SettingsControllerInterface {
  private _notificationsSubject = this.createSubject('notifications', true);
  private _autoSaveSubject = this.createSubject('autoSave', false);

  get notifications(): boolean {
    return this._notificationsSubject.value;
  }

  get autoSave(): boolean {
    return this._autoSaveSubject.value;
  }

  toggleNotifications(): void {
    const current = this._notificationsSubject.value;
    this._notificationsSubject.next(!current);
  }

  toggleAutoSave(): void {
    const current = this._autoSaveSubject.value;
    this._autoSaveSubject.next(!current);
  }

  onInit(): void {
    console.log('SettingsController initialized (Lazy)');
  }

  onDispose(): void {
    console.log('SettingsController disposed (Lazy)');
    super.onDispose();
  }
} 