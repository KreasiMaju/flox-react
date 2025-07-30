import React from 'react';

type Observer<T> = (value: T) => void;
declare class Subject<T> {
    private _value;
    private _observers;
    private _isDisposed;
    constructor(initialValue: T);
    /**
     * Mendapatkan nilai saat ini
     */
    get value(): T;
    /**
     * Subscribe ke perubahan nilai
     */
    subscribe(observer: Observer<T>): () => void;
    /**
     * Update nilai dan notify semua observers
     */
    next(value: T): void;
    /**
     * Update nilai tanpa notify observers (untuk internal use)
     */
    setValue(value: T): void;
    /**
     * Dispose subject
     */
    dispose(): void;
    /**
     * Check apakah subject sudah di-dispose
     */
    get isDisposed(): boolean;
    /**
     * Jumlah observers yang aktif
     */
    get observerCount(): number;
}

declare abstract class Controller {
    private _subjects;
    private _isDisposed;
    /**
     * Membuat reactive subject untuk state
     */
    protected createSubject<T>(key: string, initialValue: T): Subject<T>;
    /**
     * Mendapatkan subject berdasarkan key
     */
    protected getSubject<T>(key: string): Subject<T> | undefined;
    /**
     * Public method untuk mendapatkan subject
     */
    getSubjectPublic<T>(key: string): Subject<T> | undefined;
    /**
     * Update nilai subject
     */
    protected updateSubject<T>(key: string, value: T): void;
    /**
     * Lifecycle method - dipanggil saat controller diinisialisasi
     */
    onInit(): void;
    /**
     * Lifecycle method - dipanggil saat controller akan dihapus
     */
    onDispose(): void;
    /**
     * Check apakah controller sudah di-dispose
     */
    get isDisposed(): boolean;
    /**
     * Mendapatkan semua subjects
     */
    get subjects(): Map<string, Subject<any>>;
}

interface BindingInterface {
    dependencies(): void;
}
declare abstract class Binding implements BindingInterface {
    private _controllers;
    private _fenixControllers;
    private _permanentControllers;
    private _lazyFactories;
    private _isInitialized;
    /**
     * Register controller dengan key
     */
    protected putController<T extends Controller>(key: string, controller: T): T;
    /**
     * Register controller sebagai Fenix (recreate setiap kali dibutuhkan)
     */
    protected putFenix<T extends Controller>(key: string, controllerFactory: () => T): void;
    /**
     * Register controller sebagai Permanent (tidak pernah di-dispose)
     */
    protected putPermanent<T extends Controller>(key: string, controller: T): T;
    /**
     * Lazy Put - controller hanya dibuat saat pertama kali diakses
     */
    protected lazyPut<T extends Controller>(key: string, controllerFactory: () => T): void;
    /**
     * Mendapatkan controller berdasarkan key
     */
    protected getController<T extends Controller>(key: string): T | undefined;
    /**
     * Public method untuk mendapatkan controller
     */
    getControllerPublic<T extends Controller>(key: string): T | undefined;
    /**
     * Mendapatkan controller atau throw error jika tidak ditemukan
     */
    protected findController<T extends Controller>(key: string): T;
    /**
     * Remove controller berdasarkan key
     */
    protected removeController(key: string): boolean;
    /**
     * Get Fenix controller (recreate jika perlu)
     */
    protected getFenix<T extends Controller>(key: string, controllerFactory: () => T): T;
    /**
     * Initialize binding dan semua controllers
     */
    initialize(): void;
    /**
     * Dispose binding dan semua controllers (kecuali permanent)
     */
    dispose(): void;
    /**
     * Check apakah binding sudah di-initialize
     */
    get isInitialized(): boolean;
    /**
     * Mendapatkan semua controllers
     */
    get controllers(): Map<string, Controller>;
    /**
     * Abstract method yang harus diimplementasikan untuk mendefinisikan dependencies
     */
    abstract dependencies(): void;
}

declare class Flox {
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
declare const flox: Flox;

declare class Rx<T> {
    private _subject;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
    map<U>(transform: (value: T) => U): Rx<U>;
    where(predicate: (value: T) => boolean): Rx<T>;
    update(updater: (value: T) => T): void;
    subscribe(observer: (value: T) => void): () => void;
    dispose(): void;
}
declare function rx<T>(initialValue: T): Rx<T>;
declare function rxInt(initialValue: number): Rx<number>;
declare function rxString(initialValue: string): Rx<string>;
declare function rxBool(initialValue: boolean): Rx<boolean>;

declare class Get {
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

declare class BackgroundWorker {
    private static _workers;
    static create(key: string, task: () => void | Promise<void>): void;
    static start(key: string): void;
    static stop(key: string): void;
    static delete(key: string): boolean;
    static isRunning(key: string): boolean;
}

declare function useController<T extends Controller>(controller: T): T;
declare function useSubject<T>(subject: Subject<T>): [T, (value: T) => void];
declare function useControllerSubject<T extends Controller, K extends keyof T['subjects']>(controller: T, subjectKey: K): [any, (value: any) => void];

declare function useBinding(key: string, binding: Binding): Binding;
declare function useGlobalController<T extends Controller>(key: string, controller: T): T;

declare function useRx<T>(rx: Rx<T>): [T, (value: T) => void];
declare function useRxValue<T>(rx: Rx<T>): T;

interface HomeViewModel {
    count: number;
    name: string;
    isLoading: boolean;
}
interface HomeControllerInterface {
    viewModel: HomeViewModel;
    increment(): void;
    decrement(): void;
    updateName(name: string): void;
    setLoading(loading: boolean): void;
}
interface HomeControllerRepository {
    fetchData(): Promise<void>;
    saveData(data: any): Promise<void>;
}
declare class HomeController extends Controller implements HomeControllerInterface, HomeControllerRepository {
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

interface UserControllerInterface {
    userId: string;
    username: string;
    setUser(userId: string, username: string): void;
    clearUser(): void;
}
declare class UserController extends Controller implements UserControllerInterface {
    private _userIdSubject;
    private _usernameSubject;
    get userId(): string;
    get username(): string;
    setUser(userId: string, username: string): void;
    clearUser(): void;
    onInit(): void;
    onDispose(): void;
}

interface AppControllerInterface {
    theme: string;
    language: string;
    setTheme(theme: string): void;
    setLanguage(language: string): void;
}
declare class AppController extends Controller implements AppControllerInterface {
    private _themeSubject;
    private _languageSubject;
    get theme(): string;
    get language(): string;
    setTheme(theme: string): void;
    setLanguage(language: string): void;
    onInit(): void;
    onDispose(): void;
}

interface SettingsControllerInterface {
    notifications: boolean;
    autoSave: boolean;
    toggleNotifications(): void;
    toggleAutoSave(): void;
}
declare class SettingsController extends Controller implements SettingsControllerInterface {
    private _notificationsSubject;
    private _autoSaveSubject;
    get notifications(): boolean;
    get autoSave(): boolean;
    toggleNotifications(): void;
    toggleAutoSave(): void;
    onInit(): void;
    onDispose(): void;
}

interface AdvancedControllerInterface {
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
declare class AdvancedController extends Controller implements AdvancedControllerInterface {
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

declare class HomeBinding extends Binding {
    dependencies(): void;
}

declare const SimpleCounter: React.FC;

declare const SimpleHomePage: React.FC;

declare const FenixPermanentDemo: React.FC;

declare const AdvancedDemo: React.FC;

export { AdvancedController, AdvancedDemo, AppController, BackgroundWorker, Binding, Controller, FenixPermanentDemo, Flox, Get, HomeBinding, HomeController, Rx, SettingsController, SimpleCounter, SimpleHomePage, Subject, UserController, flox, rx, rxBool, rxInt, rxString, useBinding, useController, useControllerSubject, useGlobalController, useRx, useRxValue, useSubject };
export type { AdvancedControllerInterface, AppControllerInterface, BindingInterface, HomeControllerInterface, HomeControllerRepository, HomeViewModel, Observer, SettingsControllerInterface, UserControllerInterface };
