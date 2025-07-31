import require$$0, { useEffect, useState, useCallback, useMemo } from 'react';

class Subject {
    constructor(initialValue) {
        Object.defineProperty(this, "_value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_observers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_isDisposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this._value = initialValue;
    }
    /**
     * Mendapatkan nilai saat ini
     */
    get value() {
        return this._value;
    }
    /**
     * Subscribe ke perubahan nilai
     */
    subscribe(observer) {
        if (this._isDisposed) {
            throw new Error('Subject sudah di-dispose');
        }
        this._observers.add(observer);
        // Langsung panggil observer dengan nilai saat ini
        observer(this._value);
        // Return unsubscribe function
        return () => {
            this._observers.delete(observer);
        };
    }
    /**
     * Update nilai dan notify semua observers
     */
    next(value) {
        if (this._isDisposed)
            return;
        this._value = value;
        this._observers.forEach(observer => {
            try {
                observer(value);
            }
            catch (error) {
                console.error('Error in observer:', error);
            }
        });
    }
    /**
     * Update nilai tanpa notify observers (untuk internal use)
     */
    setValue(value) {
        if (this._isDisposed)
            return;
        this._value = value;
    }
    /**
     * Dispose subject
     */
    dispose() {
        if (this._isDisposed)
            return;
        this._isDisposed = true;
        this._observers.clear();
    }
    /**
     * Check apakah subject sudah di-dispose
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Jumlah observers yang aktif
     */
    get observerCount() {
        return this._observers.size;
    }
}

class Controller {
    constructor() {
        Object.defineProperty(this, "_subjects", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_isDisposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    /**
     * Membuat reactive subject untuk state
     */
    createSubject(key, initialValue) {
        if (this._subjects.has(key)) {
            return this._subjects.get(key);
        }
        const subject = new Subject(initialValue);
        this._subjects.set(key, subject);
        return subject;
    }
    /**
     * Mendapatkan subject berdasarkan key
     */
    getSubject(key) {
        return this._subjects.get(key);
    }
    /**
     * Public method untuk mendapatkan subject
     */
    getSubjectPublic(key) {
        return this.getSubject(key);
    }
    /**
     * Update nilai subject
     */
    updateSubject(key, value) {
        const subject = this._subjects.get(key);
        if (subject) {
            subject.next(value);
        }
    }
    /**
     * Lifecycle method - dipanggil saat controller diinisialisasi
     */
    onInit() {
        // Override di subclass jika diperlukan
    }
    /**
     * Lifecycle method - dipanggil saat controller akan dihapus
     */
    onDispose() {
        if (this._isDisposed)
            return;
        this._isDisposed = true;
        // Dispose semua subjects
        this._subjects.forEach(subject => subject.dispose());
        this._subjects.clear();
    }
    /**
     * Check apakah controller sudah di-dispose
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Mendapatkan semua subjects
     */
    get subjects() {
        return this._subjects;
    }
}

class Binding {
    constructor() {
        Object.defineProperty(this, "_controllers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_fenixControllers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_permanentControllers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_lazyFactories", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    /**
     * Register controller dengan key
     */
    putController(key, controller) {
        if (this._controllers.has(key)) {
            console.warn(`Controller dengan key '${key}' sudah ada, akan di-override`);
        }
        this._controllers.set(key, controller);
        return controller;
    }
    /**
     * Register controller sebagai Fenix (recreate setiap kali dibutuhkan)
     */
    putFenix(key, controllerFactory) {
        this._fenixControllers.add(key);
        this._controllers.set(key, controllerFactory());
    }
    /**
     * Register controller sebagai Permanent (tidak pernah di-dispose)
     */
    putPermanent(key, controller) {
        this._permanentControllers.add(key);
        this._controllers.set(key, controller);
        return controller;
    }
    /**
     * Lazy Put - controller hanya dibuat saat pertama kali diakses
     */
    lazyPut(key, controllerFactory) {
        // Simpan factory function untuk lazy initialization
        this._lazyFactories.set(key, controllerFactory);
    }
    /**
     * Mendapatkan controller berdasarkan key
     */
    getController(key) {
        // Check jika ada lazy factory
        const lazyFactory = this._lazyFactories.get(key);
        if (lazyFactory && !this._controllers.has(key)) {
            // Lazy initialize controller
            const controller = lazyFactory();
            this._controllers.set(key, controller);
            controller.onInit();
        }
        return this._controllers.get(key);
    }
    /**
     * Public method untuk mendapatkan controller
     */
    getControllerPublic(key) {
        return this.getController(key);
    }
    /**
     * Mendapatkan controller atau throw error jika tidak ditemukan
     */
    findController(key) {
        const controller = this.getController(key);
        if (!controller) {
            throw new Error(`Controller dengan key '${key}' tidak ditemukan`);
        }
        return controller;
    }
    /**
     * Remove controller berdasarkan key
     */
    removeController(key) {
        const controller = this._controllers.get(key);
        if (controller && !this._permanentControllers.has(key)) {
            controller.onDispose();
            return this._controllers.delete(key);
        }
        return false;
    }
    /**
     * Get Fenix controller (recreate jika perlu)
     */
    getFenix(key, controllerFactory) {
        if (!this._fenixControllers.has(key)) {
            throw new Error(`Controller dengan key '${key}' bukan Fenix controller`);
        }
        // Recreate controller untuk Fenix
        const controller = controllerFactory();
        this._controllers.set(key, controller);
        return controller;
    }
    /**
     * Initialize binding dan semua controllers
     */
    initialize() {
        if (this._isInitialized)
            return;
        this.dependencies();
        // Initialize semua controllers
        this._controllers.forEach(controller => {
            controller.onInit();
        });
        this._isInitialized = true;
    }
    /**
     * Dispose binding dan semua controllers (kecuali permanent)
     */
    dispose() {
        this._controllers.forEach((controller, key) => {
            if (!this._permanentControllers.has(key)) {
                controller.onDispose();
            }
        });
        this._controllers.clear();
        this._fenixControllers.clear();
        this._permanentControllers.clear();
        this._lazyFactories.clear();
        this._isInitialized = false;
    }
    /**
     * Check apakah binding sudah di-initialize
     */
    get isInitialized() {
        return this._isInitialized;
    }
    /**
     * Mendapatkan semua controllers
     */
    get controllers() {
        return this._controllers;
    }
}

class Flox {
    constructor() {
        Object.defineProperty(this, "_bindings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_globalControllers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Singleton instance
     */
    static get instance() {
        if (!Flox._instance) {
            Flox._instance = new Flox();
        }
        return Flox._instance;
    }
    /**
     * Put binding dengan key
     */
    putBinding(key, binding) {
        if (this._bindings.has(key)) {
            console.warn(`Binding dengan key '${key}' sudah ada, akan di-override`);
            this._bindings.get(key)?.dispose();
        }
        this._bindings.set(key, binding);
        binding.initialize();
    }
    /**
     * Mendapatkan binding berdasarkan key
     */
    getBinding(key) {
        return this._bindings.get(key);
    }
    /**
     * Remove binding berdasarkan key
     */
    removeBinding(key) {
        const binding = this._bindings.get(key);
        if (binding) {
            binding.dispose();
            return this._bindings.delete(key);
        }
        return false;
    }
    /**
     * Put global controller
     */
    putController(key, controller) {
        if (this._globalControllers.has(key)) {
            console.warn(`Global controller dengan key '${key}' sudah ada, akan di-override`);
            this._globalControllers.get(key)?.onDispose();
        }
        this._globalControllers.set(key, controller);
        controller.onInit();
        return controller;
    }
    /**
     * Mendapatkan global controller
     */
    getController(key) {
        return this._globalControllers.get(key);
    }
    /**
     * Mendapatkan global controller atau throw error
     */
    findController(key) {
        const controller = this.getController(key);
        if (!controller) {
            throw new Error(`Global controller dengan key '${key}' tidak ditemukan`);
        }
        return controller;
    }
    /**
     * Remove global controller
     */
    removeController(key) {
        const controller = this._globalControllers.get(key);
        if (controller) {
            controller.onDispose();
            return this._globalControllers.delete(key);
        }
        return false;
    }
    /**
     * Dispose semua bindings dan controllers
     */
    dispose() {
        this._bindings.forEach(binding => binding.dispose());
        this._bindings.clear();
        this._globalControllers.forEach(controller => controller.onDispose());
        this._globalControllers.clear();
    }
    /**
     * Mendapatkan semua bindings
     */
    get bindings() {
        return this._bindings;
    }
    /**
     * Mendapatkan semua global controllers
     */
    get globalControllers() {
        return this._globalControllers;
    }
}
// Export singleton instance
const flox = Flox.instance;

class Rx {
    constructor(initialValue) {
        Object.defineProperty(this, "_subject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._subject = new Subject(initialValue);
    }
    get value() {
        return this._subject.value;
    }
    set value(newValue) {
        this._subject.next(newValue);
    }
    // Reactive operators
    map(transform) {
        const newRx = new Rx(transform(this.value));
        this._subject.subscribe(value => {
            newRx.value = transform(value);
        });
        return newRx;
    }
    where(predicate) {
        const newRx = new Rx(this.value);
        this._subject.subscribe(value => {
            if (predicate(value)) {
                newRx.value = value;
            }
        });
        return newRx;
    }
    // Utility methods
    update(updater) {
        this.value = updater(this.value);
    }
    // Subscribe
    subscribe(observer) {
        return this._subject.subscribe(observer);
    }
    // Dispose
    dispose() {
        this._subject.dispose();
    }
}
// Factory functions
function rx(initialValue) {
    return new Rx(initialValue);
}
function rxInt(initialValue) {
    return new Rx(initialValue);
}
function rxString(initialValue) {
    return new Rx(initialValue);
}
function rxBool(initialValue) {
    return new Rx(initialValue);
}

class Get {
    // Controller management
    static put(key, controller) {
        return flox.putController(key, controller);
    }
    static find(key) {
        return flox.findController(key);
    }
    static delete(key) {
        return flox.removeController(key);
    }
    // Binding management
    static putBinding(key, binding) {
        flox.putBinding(key, binding);
    }
    static findBinding(key) {
        return flox.getBinding(key);
    }
    static deleteBinding(key) {
        return flox.removeBinding(key);
    }
    // Utility methods
    static isRegistered(key) {
        return flox.getController(key) !== undefined;
    }
    static isBindingRegistered(key) {
        return flox.getBinding(key) !== undefined;
    }
    // Snackbar (simplified)
    static snackbar(message, duration = 3000) {
        // Simple implementation - bisa di-extend dengan library UI
        console.log(`Snackbar: ${message}`);
        // Create temporary snackbar element
        const snackbar = document.createElement('div');
        snackbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
        snackbar.textContent = message;
        document.body.appendChild(snackbar);
        setTimeout(() => {
            document.body.removeChild(snackbar);
        }, duration);
    }
    // Dialog (simplified)
    static dialog(title, content) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${content}`);
            resolve(result);
        });
    }
    // Loading
    static loading(message = 'Loading...') {
        console.log(`Loading: ${message}`);
        // Implementation bisa di-extend
    }
    static closeLoading() {
        console.log('Loading closed');
        // Implementation bisa di-extend
    }
}

class BackgroundWorker {
    static create(key, task) {
        // Simple implementation using setTimeout
        const worker = {
            task,
            isRunning: false,
            start: () => {
                if (!worker.isRunning) {
                    worker.isRunning = true;
                    setTimeout(async () => {
                        try {
                            await worker.task();
                        }
                        catch (error) {
                            console.error('Worker error:', error);
                        }
                        finally {
                            worker.isRunning = false;
                        }
                    }, 0);
                }
            },
            stop: () => {
                worker.isRunning = false;
            }
        };
        this._workers.set(key, worker);
    }
    static start(key) {
        const worker = this._workers.get(key);
        if (worker) {
            worker.start();
        }
    }
    static stop(key) {
        const worker = this._workers.get(key);
        if (worker) {
            worker.stop();
        }
    }
    static delete(key) {
        const worker = this._workers.get(key);
        if (worker) {
            worker.stop();
            return this._workers.delete(key);
        }
        return false;
    }
    static isRunning(key) {
        const worker = this._workers.get(key);
        return worker ? worker.isRunning : false;
    }
}
Object.defineProperty(BackgroundWorker, "_workers", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});

function useController(controller) {
    useEffect(() => {
        // Cleanup saat component unmount
        return () => {
            // Note: Controller tidak di-dispose otomatis karena bisa digunakan di multiple components
            // Dispose hanya dilakukan saat binding di-dispose
        };
    }, [controller]);
    return controller;
}
function useSubject(subject) {
    const [value, setValue] = useState(subject.value);
    useEffect(() => {
        const unsubscribe = subject.subscribe(setValue);
        return unsubscribe;
    }, [subject]);
    const updateValue = useCallback((newValue) => {
        subject.next(newValue);
    }, [subject]);
    return [value, updateValue];
}
function useControllerSubject(controller, subjectKey) {
    const subject = controller.subjects.get(subjectKey);
    if (!subject) {
        throw new Error(`Subject dengan key '${String(subjectKey)}' tidak ditemukan di controller`);
    }
    return useSubject(subject);
}

function useBinding(key, binding) {
    useEffect(() => {
        // Initialize binding jika belum
        if (!binding.isInitialized) {
            binding.initialize();
        }
        flox.putBinding(key, binding);
        return () => {
            flox.removeBinding(key);
        };
    }, [key, binding]);
    return binding;
}
function useGlobalController(key, controller) {
    useEffect(() => {
        flox.putController(key, controller);
        return () => {
            flox.removeController(key);
        };
    }, [key, controller]);
    return controller;
}

function useRx(rx) {
    const [value, setValue] = useState(rx.value);
    useEffect(() => {
        const unsubscribe = rx.subscribe(setValue);
        return unsubscribe;
    }, [rx]);
    const updateValue = (newValue) => {
        rx.value = newValue;
    };
    return [value, updateValue];
}
function useRxValue(rx) {
    const [value] = useRx(rx);
    return value;
}

// Controller implementation
class HomeController extends Controller {
    constructor() {
        super();
        // ViewModel subjects
        Object.defineProperty(this, "_countSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_nameSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_loadingSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Initialize subjects
        this._countSubject = this.createSubject('count', 0);
        this._nameSubject = this.createSubject('name', 'Flox User');
        this._loadingSubject = this.createSubject('isLoading', false);
    }
    // ViewModel getter
    get viewModel() {
        return {
            count: this._countSubject.value,
            name: this._nameSubject.value,
            isLoading: this._loadingSubject.value
        };
    }
    // Controller methods
    increment() {
        const currentCount = this._countSubject.value;
        this._countSubject.next(currentCount + 1);
    }
    decrement() {
        const currentCount = this._countSubject.value;
        this._countSubject.next(currentCount - 1);
    }
    updateName(name) {
        this._nameSubject.next(name);
    }
    setLoading(loading) {
        this._loadingSubject.next(loading);
    }
    // Repository methods
    async fetchData() {
        this.setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Update data
            this.updateName('Data loaded successfully');
        }
        catch (error) {
            console.error('Error fetching data:', error);
            this.updateName('Error loading data');
        }
        finally {
            this.setLoading(false);
        }
    }
    async saveData(data) {
        this.setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Data saved:', data);
        }
        catch (error) {
            console.error('Error saving data:', error);
        }
        finally {
            this.setLoading(false);
        }
    }
    // Lifecycle
    onInit() {
        console.log('HomeController initialized');
        // Load initial data
        this.fetchData();
    }
    onDispose() {
        console.log('HomeController disposed');
        super.onDispose();
    }
}

class UserController extends Controller {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_userIdSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.createSubject('userId', '')
        });
        Object.defineProperty(this, "_usernameSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.createSubject('username', '')
        });
    }
    get userId() {
        return this._userIdSubject.value;
    }
    get username() {
        return this._usernameSubject.value;
    }
    setUser(userId, username) {
        this._userIdSubject.next(userId);
        this._usernameSubject.next(username);
    }
    clearUser() {
        this._userIdSubject.next('');
        this._usernameSubject.next('');
    }
    onInit() {
        console.log('UserController initialized');
    }
    onDispose() {
        console.log('UserController disposed');
        super.onDispose();
    }
}

class AppController extends Controller {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_themeSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.createSubject('theme', 'light')
        });
        Object.defineProperty(this, "_languageSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.createSubject('language', 'en')
        });
    }
    get theme() {
        return this._themeSubject.value;
    }
    get language() {
        return this._languageSubject.value;
    }
    setTheme(theme) {
        this._themeSubject.next(theme);
    }
    setLanguage(language) {
        this._languageSubject.next(language);
    }
    onInit() {
        console.log('AppController initialized (Permanent)');
    }
    onDispose() {
        console.log('AppController disposed (Permanent)');
        super.onDispose();
    }
}

class SettingsController extends Controller {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_notificationsSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.createSubject('notifications', true)
        });
        Object.defineProperty(this, "_autoSaveSubject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.createSubject('autoSave', false)
        });
    }
    get notifications() {
        return this._notificationsSubject.value;
    }
    get autoSave() {
        return this._autoSaveSubject.value;
    }
    toggleNotifications() {
        const current = this._notificationsSubject.value;
        this._notificationsSubject.next(!current);
    }
    toggleAutoSave() {
        const current = this._autoSaveSubject.value;
        this._autoSaveSubject.next(!current);
    }
    onInit() {
        console.log('SettingsController initialized (Lazy)');
    }
    onDispose() {
        console.log('SettingsController disposed (Lazy)');
        super.onDispose();
    }
}

class AdvancedController extends Controller {
    constructor() {
        super();
        // Rx variables
        Object.defineProperty(this, "count", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rxInt(0)
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rxString('Advanced User')
        });
        Object.defineProperty(this, "isLoading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rxBool(false)
        });
        // Register worker
        BackgroundWorker.create('background-task', async () => {
            this.isLoading.value = true;
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.count.value += 10;
            this.isLoading.value = false;
            Get.snackbar('Background task completed!');
        });
    }
    increment() {
        this.count.value++;
    }
    decrement() {
        this.count.value--;
    }
    updateName(name) {
        this.name.value = name;
    }
    startBackgroundTask() {
        BackgroundWorker.start('background-task');
    }
    showSnackbar() {
        Get.snackbar(`Hello ${this.name.value}! Count is ${this.count.value}`);
    }
    async showDialog() {
        const confirmed = await Get.dialog('Confirmation', `Are you sure you want to reset count from ${this.count.value} to 0?`);
        if (confirmed) {
            this.count.value = 0;
            Get.snackbar('Count reset to 0!');
        }
    }
    onInit() {
        console.log('AdvancedController initialized with Rx variables');
    }
    onDispose() {
        BackgroundWorker.delete('background-task');
        this.count.dispose();
        this.name.dispose();
        this.isLoading.dispose();
        super.onDispose();
    }
}

class HomeBinding extends Binding {
    dependencies() {
        // Normal controller
        this.putController('home', new HomeController());
        // Fenix controller (recreate setiap kali dibutuhkan)
        this.putFenix('user', () => new UserController());
        // Permanent controller (tidak pernah di-dispose)
        this.putPermanent('app', new AppController());
        // Lazy controller (hanya dibuat saat pertama kali diakses)
        this.lazyPut('settings', () => new SettingsController());
    }
}

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=require$$0,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	var React = require$$0;

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types.
	var REACT_ELEMENT_TYPE = Symbol.for('react.element');
	var REACT_PORTAL_TYPE = Symbol.for('react.portal');
	var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
	var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
	var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
	var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
	var REACT_CONTEXT_TYPE = Symbol.for('react.context');
	var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
	var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
	var REACT_MEMO_TYPE = Symbol.for('react.memo');
	var REACT_LAZY_TYPE = Symbol.for('react.lazy');
	var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	function getIteratorFn(maybeIterable) {
	  if (maybeIterable === null || typeof maybeIterable !== 'object') {
	    return null;
	  }

	  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

	  if (typeof maybeIterator === 'function') {
	    return maybeIterator;
	  }

	  return null;
	}

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      printWarning('error', format, args);
	    }
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    } // eslint-disable-next-line react-internal/safe-string-coercion


	    var argsWithFormat = args.map(function (item) {
	      return String(item);
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	// -----------------------------------------------------------------------------

	var enableScopeAPI = false; // Experimental Create Event Handle API.
	var enableCacheElement = false;
	var enableTransitionTracing = false; // No known bugs, but needs performance testing

	var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
	// stuff. Intended to enable React core members to more easily debug scheduling
	// issues in DEV builds.

	var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

	var REACT_MODULE_REFERENCE;

	{
	  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
	}

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	    // types supported by any Flight configuration anywhere since
	    // we don't know which Flight build this will end up being used
	    // with.
	    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
	      return true;
	    }
	  }

	  return false;
	}

	function getWrappedName(outerType, innerType, wrapperName) {
	  var displayName = outerType.displayName;

	  if (displayName) {
	    return displayName;
	  }

	  var functionName = innerType.displayName || innerType.name || '';
	  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
	} // Keep in sync with react-reconciler/getComponentNameFromFiber


	function getContextName(type) {
	  return type.displayName || 'Context';
	} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


	function getComponentNameFromType(type) {
	  if (type == null) {
	    // Host root, text node or just invalid type.
	    return null;
	  }

	  {
	    if (typeof type.tag === 'number') {
	      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
	    }
	  }

	  if (typeof type === 'function') {
	    return type.displayName || type.name || null;
	  }

	  if (typeof type === 'string') {
	    return type;
	  }

	  switch (type) {
	    case REACT_FRAGMENT_TYPE:
	      return 'Fragment';

	    case REACT_PORTAL_TYPE:
	      return 'Portal';

	    case REACT_PROFILER_TYPE:
	      return 'Profiler';

	    case REACT_STRICT_MODE_TYPE:
	      return 'StrictMode';

	    case REACT_SUSPENSE_TYPE:
	      return 'Suspense';

	    case REACT_SUSPENSE_LIST_TYPE:
	      return 'SuspenseList';

	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_CONTEXT_TYPE:
	        var context = type;
	        return getContextName(context) + '.Consumer';

	      case REACT_PROVIDER_TYPE:
	        var provider = type;
	        return getContextName(provider._context) + '.Provider';

	      case REACT_FORWARD_REF_TYPE:
	        return getWrappedName(type, type.render, 'ForwardRef');

	      case REACT_MEMO_TYPE:
	        var outerName = type.displayName || null;

	        if (outerName !== null) {
	          return outerName;
	        }

	        return getComponentNameFromType(type.type) || 'Memo';

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            return getComponentNameFromType(init(payload));
	          } catch (x) {
	            return null;
	          }
	        }

	      // eslint-disable-next-line no-fallthrough
	    }
	  }

	  return null;
	}

	var assign = Object.assign;

	// Helpers to patch console.logs to avoid logging during side-effect free
	// replaying on render function. This currently only patches the object
	// lazily which won't cover if the log function was extracted eagerly.
	// We could also eagerly patch the method.
	var disabledDepth = 0;
	var prevLog;
	var prevInfo;
	var prevWarn;
	var prevError;
	var prevGroup;
	var prevGroupCollapsed;
	var prevGroupEnd;

	function disabledLog() {}

	disabledLog.__reactDisabledLog = true;
	function disableLogs() {
	  {
	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      prevLog = console.log;
	      prevInfo = console.info;
	      prevWarn = console.warn;
	      prevError = console.error;
	      prevGroup = console.group;
	      prevGroupCollapsed = console.groupCollapsed;
	      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

	      var props = {
	        configurable: true,
	        enumerable: true,
	        value: disabledLog,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        info: props,
	        log: props,
	        warn: props,
	        error: props,
	        group: props,
	        groupCollapsed: props,
	        groupEnd: props
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    disabledDepth++;
	  }
	}
	function reenableLogs() {
	  {
	    disabledDepth--;

	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      var props = {
	        configurable: true,
	        enumerable: true,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        log: assign({}, props, {
	          value: prevLog
	        }),
	        info: assign({}, props, {
	          value: prevInfo
	        }),
	        warn: assign({}, props, {
	          value: prevWarn
	        }),
	        error: assign({}, props, {
	          value: prevError
	        }),
	        group: assign({}, props, {
	          value: prevGroup
	        }),
	        groupCollapsed: assign({}, props, {
	          value: prevGroupCollapsed
	        }),
	        groupEnd: assign({}, props, {
	          value: prevGroupEnd
	        })
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    if (disabledDepth < 0) {
	      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
	    }
	  }
	}

	var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	var prefix;
	function describeBuiltInComponentFrame(name, source, ownerFn) {
	  {
	    if (prefix === undefined) {
	      // Extract the VM specific prefix used by each line.
	      try {
	        throw Error();
	      } catch (x) {
	        var match = x.stack.trim().match(/\n( *(at )?)/);
	        prefix = match && match[1] || '';
	      }
	    } // We use the prefix to ensure our stacks line up with native stack frames.


	    return '\n' + prefix + name;
	  }
	}
	var reentry = false;
	var componentFrameCache;

	{
	  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
	  componentFrameCache = new PossiblyWeakMap();
	}

	function describeNativeComponentFrame(fn, construct) {
	  // If something asked for a stack inside a fake render, it should get ignored.
	  if ( !fn || reentry) {
	    return '';
	  }

	  {
	    var frame = componentFrameCache.get(fn);

	    if (frame !== undefined) {
	      return frame;
	    }
	  }

	  var control;
	  reentry = true;
	  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

	  Error.prepareStackTrace = undefined;
	  var previousDispatcher;

	  {
	    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
	    // for warnings.

	    ReactCurrentDispatcher.current = null;
	    disableLogs();
	  }

	  try {
	    // This should throw.
	    if (construct) {
	      // Something should be setting the props in the constructor.
	      var Fake = function () {
	        throw Error();
	      }; // $FlowFixMe


	      Object.defineProperty(Fake.prototype, 'props', {
	        set: function () {
	          // We use a throwing setter instead of frozen or non-writable props
	          // because that won't throw in a non-strict mode function.
	          throw Error();
	        }
	      });

	      if (typeof Reflect === 'object' && Reflect.construct) {
	        // We construct a different control for this case to include any extra
	        // frames added by the construct call.
	        try {
	          Reflect.construct(Fake, []);
	        } catch (x) {
	          control = x;
	        }

	        Reflect.construct(fn, [], Fake);
	      } else {
	        try {
	          Fake.call();
	        } catch (x) {
	          control = x;
	        }

	        fn.call(Fake.prototype);
	      }
	    } else {
	      try {
	        throw Error();
	      } catch (x) {
	        control = x;
	      }

	      fn();
	    }
	  } catch (sample) {
	    // This is inlined manually because closure doesn't do it for us.
	    if (sample && control && typeof sample.stack === 'string') {
	      // This extracts the first frame from the sample that isn't also in the control.
	      // Skipping one frame that we assume is the frame that calls the two.
	      var sampleLines = sample.stack.split('\n');
	      var controlLines = control.stack.split('\n');
	      var s = sampleLines.length - 1;
	      var c = controlLines.length - 1;

	      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	        // We expect at least one stack frame to be shared.
	        // Typically this will be the root most one. However, stack frames may be
	        // cut off due to maximum stack limits. In this case, one maybe cut off
	        // earlier than the other. We assume that the sample is longer or the same
	        // and there for cut off earlier. So we should find the root most frame in
	        // the sample somewhere in the control.
	        c--;
	      }

	      for (; s >= 1 && c >= 0; s--, c--) {
	        // Next we find the first one that isn't the same which should be the
	        // frame that called our sample function and the control.
	        if (sampleLines[s] !== controlLines[c]) {
	          // In V8, the first line is describing the message but other VMs don't.
	          // If we're about to return the first line, and the control is also on the same
	          // line, that's a pretty good indicator that our sample threw at same line as
	          // the control. I.e. before we entered the sample frame. So we ignore this result.
	          // This can happen if you passed a class to function component, or non-function.
	          if (s !== 1 || c !== 1) {
	            do {
	              s--;
	              c--; // We may still have similar intermediate frames from the construct call.
	              // The next one that isn't the same should be our match though.

	              if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
	                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
	                // but we have a user-provided "displayName"
	                // splice it in to make the stack more readable.


	                if (fn.displayName && _frame.includes('<anonymous>')) {
	                  _frame = _frame.replace('<anonymous>', fn.displayName);
	                }

	                {
	                  if (typeof fn === 'function') {
	                    componentFrameCache.set(fn, _frame);
	                  }
	                } // Return the line we found.


	                return _frame;
	              }
	            } while (s >= 1 && c >= 0);
	          }

	          break;
	        }
	      }
	    }
	  } finally {
	    reentry = false;

	    {
	      ReactCurrentDispatcher.current = previousDispatcher;
	      reenableLogs();
	    }

	    Error.prepareStackTrace = previousPrepareStackTrace;
	  } // Fallback to just using the name if we couldn't make it throw.


	  var name = fn ? fn.displayName || fn.name : '';
	  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

	  {
	    if (typeof fn === 'function') {
	      componentFrameCache.set(fn, syntheticFrame);
	    }
	  }

	  return syntheticFrame;
	}
	function describeFunctionComponentFrame(fn, source, ownerFn) {
	  {
	    return describeNativeComponentFrame(fn, false);
	  }
	}

	function shouldConstruct(Component) {
	  var prototype = Component.prototype;
	  return !!(prototype && prototype.isReactComponent);
	}

	function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

	  if (type == null) {
	    return '';
	  }

	  if (typeof type === 'function') {
	    {
	      return describeNativeComponentFrame(type, shouldConstruct(type));
	    }
	  }

	  if (typeof type === 'string') {
	    return describeBuiltInComponentFrame(type);
	  }

	  switch (type) {
	    case REACT_SUSPENSE_TYPE:
	      return describeBuiltInComponentFrame('Suspense');

	    case REACT_SUSPENSE_LIST_TYPE:
	      return describeBuiltInComponentFrame('SuspenseList');
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_FORWARD_REF_TYPE:
	        return describeFunctionComponentFrame(type.render);

	      case REACT_MEMO_TYPE:
	        // Memo may contain any component type so we recursively resolve it.
	        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            // Lazy may contain any component type so we recursively resolve it.
	            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	          } catch (x) {}
	        }
	    }
	  }

	  return '';
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var loggedTypeFailures = {};
	var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame.setExtraStackFrame(null);
	    }
	  }
	}

	function checkPropTypes(typeSpecs, values, location, componentName, element) {
	  {
	    // $FlowFixMe This is okay but Flow doesn't know it.
	    var has = Function.call.bind(hasOwnProperty);

	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.

	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            // eslint-disable-next-line react-internal/prod-error-codes
	            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
	            err.name = 'Invariant Violation';
	            throw err;
	          }

	          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
	        } catch (ex) {
	          error$1 = ex;
	        }

	        if (error$1 && !(error$1 instanceof Error)) {
	          setCurrentlyValidatingElement(element);

	          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

	          setCurrentlyValidatingElement(null);
	        }

	        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error$1.message] = true;
	          setCurrentlyValidatingElement(element);

	          error('Failed %s type: %s', location, error$1.message);

	          setCurrentlyValidatingElement(null);
	        }
	      }
	    }
	  }
	}

	var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

	function isArray(a) {
	  return isArrayImpl(a);
	}

	/*
	 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
	 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
	 *
	 * The functions in this module will throw an easier-to-understand,
	 * easier-to-debug exception with a clear errors message message explaining the
	 * problem. (Instead of a confusing exception thrown inside the implementation
	 * of the `value` object).
	 */
	// $FlowFixMe only called in DEV, so void return is not possible.
	function typeName(value) {
	  {
	    // toStringTag is needed for namespaced types like Temporal.Instant
	    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
	    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
	    return type;
	  }
	} // $FlowFixMe only called in DEV, so void return is not possible.


	function willCoercionThrow(value) {
	  {
	    try {
	      testStringCoercion(value);
	      return false;
	    } catch (e) {
	      return true;
	    }
	  }
	}

	function testStringCoercion(value) {
	  // If you ended up here by following an exception call stack, here's what's
	  // happened: you supplied an object or symbol value to React (as a prop, key,
	  // DOM attribute, CSS property, string ref, etc.) and when React tried to
	  // coerce it to a string using `'' + value`, an exception was thrown.
	  //
	  // The most common types that will cause this exception are `Symbol` instances
	  // and Temporal objects like `Temporal.Instant`. But any object that has a
	  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
	  // exception. (Library authors do this to prevent users from using built-in
	  // numeric operators like `+` or comparison operators like `>=` because custom
	  // methods are needed to perform accurate arithmetic or comparison.)
	  //
	  // To fix the problem, coerce this object or symbol value to a string before
	  // passing it to React. The most reliable way is usually `String(value)`.
	  //
	  // To find which value is throwing, check the browser or debugger console.
	  // Before this exception was thrown, there should be `console.error` output
	  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
	  // problem and how that type was used: key, atrribute, input value prop, etc.
	  // In most cases, this console output also shows the component and its
	  // ancestor components where the exception happened.
	  //
	  // eslint-disable-next-line react-internal/safe-string-coercion
	  return '' + value;
	}
	function checkKeyStringCoercion(value) {
	  {
	    if (willCoercionThrow(value)) {
	      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

	      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
	    }
	  }
	}

	var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};
	var specialPropKeyWarningShown;
	var specialPropRefWarningShown;

	function hasValidRef(config) {
	  {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.key !== undefined;
	}

	function warnIfStringRefCannotBeAutoConverted(config, self) {
	  {
	    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self) ;
	  }
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingKey = function () {
	      if (!specialPropKeyWarningShown) {
	        specialPropKeyWarningShown = true;

	        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, 'key', {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	}

	function defineRefPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingRef = function () {
	      if (!specialPropRefWarningShown) {
	        specialPropRefWarningShown = true;

	        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingRef.isReactWarning = true;
	    Object.defineProperty(props, 'ref', {
	      get: warnAboutAccessingRef,
	      configurable: true
	    });
	  }
	}
	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, instanceof check
	 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} props
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} owner
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @internal
	 */


	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allows us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,
	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,
	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.

	    Object.defineProperty(element._store, 'validated', {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: false
	    }); // self and source are DEV only properties.

	    Object.defineProperty(element, '_self', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: self
	    }); // Two elements created in two different places should be considered
	    // equal for testing purposes and therefore we hide it from enumeration.

	    Object.defineProperty(element, '_source', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: source
	    });

	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};
	/**
	 * https://github.com/reactjs/rfcs/pull/107
	 * @param {*} type
	 * @param {object} props
	 * @param {string} key
	 */

	function jsxDEV(type, config, maybeKey, source, self) {
	  {
	    var propName; // Reserved names are extracted

	    var props = {};
	    var key = null;
	    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
	    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
	    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
	    // but as an intermediary step, we will use jsxDEV for everything except
	    // <div {...props} key="Hi" />, because we aren't currently able to tell if
	    // key is explicitly declared to be undefined or not.

	    if (maybeKey !== undefined) {
	      {
	        checkKeyStringCoercion(maybeKey);
	      }

	      key = '' + maybeKey;
	    }

	    if (hasValidKey(config)) {
	      {
	        checkKeyStringCoercion(config.key);
	      }

	      key = '' + config.key;
	    }

	    if (hasValidRef(config)) {
	      ref = config.ref;
	      warnIfStringRefCannotBeAutoConverted(config, self);
	    } // Remaining properties are added to a new props object


	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    } // Resolve default props


	    if (type && type.defaultProps) {
	      var defaultProps = type.defaultProps;

	      for (propName in defaultProps) {
	        if (props[propName] === undefined) {
	          props[propName] = defaultProps[propName];
	        }
	      }
	    }

	    if (key || ref) {
	      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

	      if (key) {
	        defineKeyPropWarningGetter(props, displayName);
	      }

	      if (ref) {
	        defineRefPropWarningGetter(props, displayName);
	      }
	    }

	    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	  }
	}

	var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement$1(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	    }
	  }
	}

	var propTypesMisspellWarningShown;

	{
	  propTypesMisspellWarningShown = false;
	}
	/**
	 * Verifies the object is a ReactElement.
	 * See https://reactjs.org/docs/react-api.html#isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a ReactElement.
	 * @final
	 */


	function isValidElement(object) {
	  {
	    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	}

	function getDeclarationErrorAddendum() {
	  {
	    if (ReactCurrentOwner$1.current) {
	      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

	      if (name) {
	        return '\n\nCheck the render method of `' + name + '`.';
	      }
	    }

	    return '';
	  }
	}

	function getSourceInfoErrorAddendum(source) {
	  {

	    return '';
	  }
	}
	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */


	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  {
	    var info = getDeclarationErrorAddendum();

	    if (!info) {
	      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

	      if (parentName) {
	        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	      }
	    }

	    return info;
	  }
	}
	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */


	function validateExplicitKey(element, parentType) {
	  {
	    if (!element._store || element._store.validated || element.key != null) {
	      return;
	    }

	    element._store.validated = true;
	    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

	    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	      return;
	    }

	    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
	    // property, it may be the creator of the child that's responsible for
	    // assigning it a key.

	    var childOwner = '';

	    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	      // Give the component that originally created this child.
	      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
	    }

	    setCurrentlyValidatingElement$1(element);

	    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

	    setCurrentlyValidatingElement$1(null);
	  }
	}
	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */


	function validateChildKeys(node, parentType) {
	  {
	    if (typeof node !== 'object') {
	      return;
	    }

	    if (isArray(node)) {
	      for (var i = 0; i < node.length; i++) {
	        var child = node[i];

	        if (isValidElement(child)) {
	          validateExplicitKey(child, parentType);
	        }
	      }
	    } else if (isValidElement(node)) {
	      // This element was passed in a valid location.
	      if (node._store) {
	        node._store.validated = true;
	      }
	    } else if (node) {
	      var iteratorFn = getIteratorFn(node);

	      if (typeof iteratorFn === 'function') {
	        // Entry iterators used to provide implicit keys,
	        // but now we print a separate warning for them later.
	        if (iteratorFn !== node.entries) {
	          var iterator = iteratorFn.call(node);
	          var step;

	          while (!(step = iterator.next()).done) {
	            if (isValidElement(step.value)) {
	              validateExplicitKey(step.value, parentType);
	            }
	          }
	        }
	      }
	    }
	  }
	}
	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */


	function validatePropTypes(element) {
	  {
	    var type = element.type;

	    if (type === null || type === undefined || typeof type === 'string') {
	      return;
	    }

	    var propTypes;

	    if (typeof type === 'function') {
	      propTypes = type.propTypes;
	    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	    // Inner props are checked in the reconciler.
	    type.$$typeof === REACT_MEMO_TYPE)) {
	      propTypes = type.propTypes;
	    } else {
	      return;
	    }

	    if (propTypes) {
	      // Intentionally inside to avoid triggering lazy initializers:
	      var name = getComponentNameFromType(type);
	      checkPropTypes(propTypes, element.props, 'prop', name, element);
	    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
	      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

	      var _name = getComponentNameFromType(type);

	      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
	    }

	    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
	      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
	    }
	  }
	}
	/**
	 * Given a fragment, validate that it can only be provided with fragment props
	 * @param {ReactElement} fragment
	 */


	function validateFragmentProps(fragment) {
	  {
	    var keys = Object.keys(fragment.props);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];

	      if (key !== 'children' && key !== 'key') {
	        setCurrentlyValidatingElement$1(fragment);

	        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

	        setCurrentlyValidatingElement$1(null);
	        break;
	      }
	    }

	    if (fragment.ref !== null) {
	      setCurrentlyValidatingElement$1(fragment);

	      error('Invalid attribute `ref` supplied to `React.Fragment`.');

	      setCurrentlyValidatingElement$1(null);
	    }
	  }
	}

	var didWarnAboutKeySpread = {};
	function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	  {
	    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.

	    if (!validType) {
	      var info = '';

	      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
	      }

	      var sourceInfo = getSourceInfoErrorAddendum();

	      if (sourceInfo) {
	        info += sourceInfo;
	      } else {
	        info += getDeclarationErrorAddendum();
	      }

	      var typeString;

	      if (type === null) {
	        typeString = 'null';
	      } else if (isArray(type)) {
	        typeString = 'array';
	      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
	        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
	        info = ' Did you accidentally export a JSX literal instead of a component?';
	      } else {
	        typeString = typeof type;
	      }

	      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
	    }

	    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.

	    if (element == null) {
	      return element;
	    } // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)


	    if (validType) {
	      var children = props.children;

	      if (children !== undefined) {
	        if (isStaticChildren) {
	          if (isArray(children)) {
	            for (var i = 0; i < children.length; i++) {
	              validateChildKeys(children[i], type);
	            }

	            if (Object.freeze) {
	              Object.freeze(children);
	            }
	          } else {
	            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
	          }
	        } else {
	          validateChildKeys(children, type);
	        }
	      }
	    }

	    {
	      if (hasOwnProperty.call(props, 'key')) {
	        var componentName = getComponentNameFromType(type);
	        var keys = Object.keys(props).filter(function (k) {
	          return k !== 'key';
	        });
	        var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

	        if (!didWarnAboutKeySpread[componentName + beforeExample]) {
	          var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';

	          error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);

	          didWarnAboutKeySpread[componentName + beforeExample] = true;
	        }
	      }
	    }

	    if (type === REACT_FRAGMENT_TYPE) {
	      validateFragmentProps(element);
	    } else {
	      validatePropTypes(element);
	    }

	    return element;
	  }
	} // These two functions exist to still get child warnings in dev
	// even with the prod transform. This means that jsxDEV is purely
	// opt-in behavior for better messages but that we won't stop
	// giving you warnings if you use production apis.

	function jsxWithValidationStatic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, true);
	  }
	}
	function jsxWithValidationDynamic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, false);
	  }
	}

	var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
	// for now we can ship identical prod functions

	var jsxs =  jsxWithValidationStatic ;

	reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_development.jsx = jsx;
	reactJsxRuntime_development.jsxs = jsxs;
	  })();
	}
	return reactJsxRuntime_development;
}

if (process.env.NODE_ENV === 'production') {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

const SimpleHomePage = () => {
    // Setup controller langsung
    const homeController = useMemo(() => new HomeController(), []);
    useController(homeController);
    // Subscribe ke subjects dengan type casting yang aman
    const countSubject = homeController.getSubjectPublic('count');
    const nameSubject = homeController.getSubjectPublic('name');
    const loadingSubject = homeController.getSubjectPublic('isLoading');
    const [count] = useSubject(countSubject);
    const [name] = useSubject(nameSubject);
    const [isLoading] = useSubject(loadingSubject);
    return (jsxRuntimeExports.jsxs("div", { style: { padding: '20px', fontFamily: 'Arial, sans-serif' }, children: [jsxRuntimeExports.jsx("h1", { children: "Flox State Management Demo" }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '20px' }, children: [jsxRuntimeExports.jsxs("h2", { children: ["Counter: ", count] }), jsxRuntimeExports.jsx("button", { onClick: () => homeController.increment(), style: { marginRight: '10px', padding: '8px 16px' }, children: "Increment" }), jsxRuntimeExports.jsx("button", { onClick: () => homeController.decrement(), style: { padding: '8px 16px' }, children: "Decrement" })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '20px' }, children: [jsxRuntimeExports.jsxs("h2", { children: ["Name: ", name] }), jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => homeController.updateName(e.target.value), style: { padding: '8px', width: '200px' }, placeholder: "Enter your name" })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '20px' }, children: [jsxRuntimeExports.jsxs("h2", { children: ["Loading State: ", isLoading ? 'Loading...' : 'Ready'] }), jsxRuntimeExports.jsx("button", { onClick: () => homeController.fetchData(), disabled: isLoading, style: { padding: '8px 16px' }, children: isLoading ? 'Loading...' : 'Fetch Data' })] }), jsxRuntimeExports.jsxs("div", { style: { marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }, children: [jsxRuntimeExports.jsx("h3", { children: "Debug Info:" }), jsxRuntimeExports.jsxs("p", { children: ["Controller Subjects: ", homeController.subjects.size] }), jsxRuntimeExports.jsxs("p", { children: ["Is Controller Disposed: ", homeController.isDisposed ? 'Yes' : 'No'] }), jsxRuntimeExports.jsxs("p", { children: ["Count Value: ", count] }), jsxRuntimeExports.jsxs("p", { children: ["Name Value: ", name] }), jsxRuntimeExports.jsxs("p", { children: ["Loading Value: ", isLoading.toString()] })] })] }));
};

const FenixPermanentDemo = () => {
    // Setup controllers langsung untuk demo
    const homeController = useMemo(() => new HomeController(), []);
    const userController = useMemo(() => new UserController(), []);
    const appController = useMemo(() => new AppController(), []);
    const settingsController = useMemo(() => new SettingsController(), []);
    // Use controllers
    const homeControllerInstance = useController(homeController);
    const userControllerInstance = useController(userController);
    const appControllerInstance = useController(appController);
    const settingsControllerInstance = useController(settingsController);
    // Subscribe ke subjects
    const [count] = useSubject(homeControllerInstance.getSubjectPublic('count'));
    const [userId] = useSubject(userControllerInstance.getSubjectPublic('userId'));
    const [username] = useSubject(userControllerInstance.getSubjectPublic('username'));
    const [theme] = useSubject(appControllerInstance.getSubjectPublic('theme'));
    const [language] = useSubject(appControllerInstance.getSubjectPublic('language'));
    const [notifications] = useSubject(settingsControllerInstance.getSubjectPublic('notifications'));
    const [autoSave] = useSubject(settingsControllerInstance.getSubjectPublic('autoSave'));
    return (jsxRuntimeExports.jsxs("div", { style: { padding: '20px', fontFamily: 'Arial, sans-serif' }, children: [jsxRuntimeExports.jsx("h1", { children: "Flox - Fenix & Permanent Demo" }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #007bff', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83D\uDD04 Normal Controller (Home)" }), jsxRuntimeExports.jsxs("p", { children: ["Counter: ", count] }), jsxRuntimeExports.jsx("button", { onClick: () => homeControllerInstance.increment(), style: { marginRight: '10px' }, children: "Increment" }), jsxRuntimeExports.jsx("button", { onClick: () => homeControllerInstance.decrement(), children: "Decrement" })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #ffc107', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83E\uDD85 Fenix Controller (User) - Recreate setiap kali dibutuhkan" }), jsxRuntimeExports.jsxs("p", { children: ["User ID: ", userId || 'Not set'] }), jsxRuntimeExports.jsxs("p", { children: ["Username: ", username || 'Not set'] }), jsxRuntimeExports.jsx("button", { onClick: () => userControllerInstance.setUser('user123', 'John Doe'), style: { marginRight: '10px' }, children: "Set User" }), jsxRuntimeExports.jsx("button", { onClick: () => userControllerInstance.clearUser(), children: "Clear User" }), jsxRuntimeExports.jsx("p", { style: { fontSize: '12px', color: '#666', marginTop: '10px' }, children: "\uD83D\uDCA1 Fenix controller akan di-recreate setiap kali dibutuhkan, state tidak dipertahankan" })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #28a745', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83D\uDD12 Permanent Controller (App) - Tidak pernah di-dispose" }), jsxRuntimeExports.jsxs("p", { children: ["Theme: ", theme] }), jsxRuntimeExports.jsxs("p", { children: ["Language: ", language] }), jsxRuntimeExports.jsx("button", { onClick: () => appControllerInstance.setTheme(theme === 'light' ? 'dark' : 'light'), style: { marginRight: '10px' }, children: "Toggle Theme" }), jsxRuntimeExports.jsx("button", { onClick: () => appControllerInstance.setLanguage(language === 'en' ? 'id' : 'en'), children: "Toggle Language" }), jsxRuntimeExports.jsx("p", { style: { fontSize: '12px', color: '#666', marginTop: '10px' }, children: "\uD83D\uDCA1 Permanent controller tidak pernah di-dispose, state dipertahankan selama aplikasi berjalan" })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #6f42c1', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83E\uDDA5 Lazy Controller (Settings) - Hanya dibuat saat pertama kali diakses" }), jsxRuntimeExports.jsxs("p", { children: ["Notifications: ", notifications ? 'ON' : 'OFF'] }), jsxRuntimeExports.jsxs("p", { children: ["Auto Save: ", autoSave ? 'ON' : 'OFF'] }), jsxRuntimeExports.jsx("button", { onClick: () => settingsControllerInstance.toggleNotifications(), style: { marginRight: '10px' }, children: "Toggle Notifications" }), jsxRuntimeExports.jsx("button", { onClick: () => settingsControllerInstance.toggleAutoSave(), children: "Toggle Auto Save" }), jsxRuntimeExports.jsx("p", { style: { fontSize: '12px', color: '#666', marginTop: '10px' }, children: "\uD83D\uDCA1 Lazy controller hanya dibuat saat pertama kali diakses, menghemat memory" })] }), jsxRuntimeExports.jsxs("div", { style: { marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h3", { children: "\uD83D\uDD0D Debug Info:" }), jsxRuntimeExports.jsxs("p", { children: ["Home Controller Subjects: ", homeControllerInstance.subjects.size] }), jsxRuntimeExports.jsxs("p", { children: ["User Controller Subjects: ", userControllerInstance.subjects.size] }), jsxRuntimeExports.jsxs("p", { children: ["App Controller Subjects: ", appControllerInstance.subjects.size] }), jsxRuntimeExports.jsxs("p", { children: ["Settings Controller Subjects: ", settingsControllerInstance.subjects.size] }), jsxRuntimeExports.jsx("p", { children: "All Controllers Loaded Successfully!" })] })] }));
};

const AdvancedDemo = () => {
    const controller = useMemo(() => new AdvancedController(), []);
    const advancedController = useController(controller);
    // Use Rx variables
    const [count, setCount] = useRx(advancedController.count);
    const [name] = useRx(advancedController.name);
    const [isLoading] = useRx(advancedController.isLoading);
    return (jsxRuntimeExports.jsxs("div", { style: { padding: '20px', fontFamily: 'Arial, sans-serif' }, children: [jsxRuntimeExports.jsx("h1", { children: "\uD83D\uDE80 Flox Advanced Features Demo" }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #007bff', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83D\uDD04 Rx Variables" }), jsxRuntimeExports.jsxs("p", { children: ["Count: ", count] }), jsxRuntimeExports.jsxs("p", { children: ["Name: ", name] }), jsxRuntimeExports.jsxs("p", { children: ["Loading: ", isLoading ? 'Yes' : 'No'] }), jsxRuntimeExports.jsxs("div", { style: { marginTop: '10px' }, children: [jsxRuntimeExports.jsx("button", { onClick: () => advancedController.increment(), style: { marginRight: '10px' }, children: "Increment" }), jsxRuntimeExports.jsx("button", { onClick: () => advancedController.decrement(), style: { marginRight: '10px' }, children: "Decrement" }), jsxRuntimeExports.jsx("button", { onClick: () => setCount(0), children: "Reset" })] }), jsxRuntimeExports.jsx("div", { style: { marginTop: '10px' }, children: jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => advancedController.updateName(e.target.value), placeholder: "Enter name", style: { marginRight: '10px', padding: '5px' } }) })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #28a745', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83D\uDEE0\uFE0F Get Utilities" }), jsxRuntimeExports.jsx("button", { onClick: () => advancedController.showSnackbar(), style: { marginRight: '10px' }, children: "Show Snackbar" }), jsxRuntimeExports.jsx("button", { onClick: () => advancedController.showDialog(), children: "Show Dialog" })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #ffc107', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\u2699\uFE0F Background Worker" }), jsxRuntimeExports.jsx("p", { children: "Click to start background task that will add 10 to count after 2 seconds" }), jsxRuntimeExports.jsx("button", { onClick: () => advancedController.startBackgroundTask(), disabled: isLoading, style: { marginRight: '10px' }, children: isLoading ? 'Running...' : 'Start Background Task' })] }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: '30px', padding: '15px', border: '2px solid #6f42c1', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h2", { children: "\uD83D\uDD27 Rx Operators" }), jsxRuntimeExports.jsxs("p", { children: ["Count doubled: ", advancedController.count.map(x => x * 2).value] }), jsxRuntimeExports.jsxs("p", { children: ["Count is even: ", advancedController.count.map(x => x % 2 === 0).value ? 'Yes' : 'No'] }), jsxRuntimeExports.jsxs("p", { children: ["Name length: ", advancedController.name.map(x => x.length).value] })] }), jsxRuntimeExports.jsxs("div", { style: { marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }, children: [jsxRuntimeExports.jsx("h3", { children: "\uD83D\uDD0D Debug Info:" }), jsxRuntimeExports.jsxs("p", { children: ["Controller Subjects: ", advancedController.subjects.size] }), jsxRuntimeExports.jsxs("p", { children: ["Is Controller Disposed: ", advancedController.isDisposed ? 'Yes' : 'No'] }), jsxRuntimeExports.jsxs("p", { children: ["Worker Running: ", isLoading ? 'Yes' : 'No'] })] })] }));
};

export { AdvancedController, AdvancedDemo, AppController, BackgroundWorker, Binding, Controller, FenixPermanentDemo, Flox, Get, HomeBinding, HomeController, Rx, SettingsController, SimpleHomePage, Subject, UserController, flox, rx, rxBool, rxInt, rxString, useBinding, useController, useControllerSubject, useGlobalController, useRx, useRxValue, useSubject };
//# sourceMappingURL=index.esm.js.map
