import { Controller } from '../core/Controller';
export interface SettingsControllerInterface {
    notifications: boolean;
    autoSave: boolean;
    toggleNotifications(): void;
    toggleAutoSave(): void;
}
export declare class SettingsController extends Controller implements SettingsControllerInterface {
    private _notificationsSubject;
    private _autoSaveSubject;
    get notifications(): boolean;
    get autoSave(): boolean;
    toggleNotifications(): void;
    toggleAutoSave(): void;
    onInit(): void;
    onDispose(): void;
}
//# sourceMappingURL=SettingsController.d.ts.map