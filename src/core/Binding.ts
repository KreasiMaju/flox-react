import { Controller } from './Controller';

export interface BindingInterface {
  dependencies(): void;
}

export abstract class Binding implements BindingInterface {
  private _controllers: Map<string, Controller> = new Map();
  private _fenixControllers: Set<string> = new Set();
  private _permanentControllers: Set<string> = new Set();
  private _lazyFactories: Map<string, () => Controller> = new Map();
  private _isInitialized = false;

  /**
   * Register controller dengan key
   */
  protected putController<T extends Controller>(key: string, controller: T): T {
    if (this._controllers.has(key)) {
      console.warn(`Controller dengan key '${key}' sudah ada, akan di-override`);
    }

    this._controllers.set(key, controller);
    return controller;
  }

  /**
   * Register controller sebagai Fenix (recreate setiap kali dibutuhkan)
   */
  protected putFenix<T extends Controller>(key: string, controllerFactory: () => T): void {
    this._fenixControllers.add(key);
    this._controllers.set(key, controllerFactory());
  }

  /**
   * Register controller sebagai Permanent (tidak pernah di-dispose)
   */
  protected putPermanent<T extends Controller>(key: string, controller: T): T {
    this._permanentControllers.add(key);
    this._controllers.set(key, controller);
    return controller;
  }

  /**
   * Lazy Put - controller hanya dibuat saat pertama kali diakses
   */
  protected lazyPut<T extends Controller>(key: string, controllerFactory: () => T): void {
    // Simpan factory function untuk lazy initialization
    this._lazyFactories.set(key, controllerFactory);
  }

  /**
   * Mendapatkan controller berdasarkan key
   */
  protected getController<T extends Controller>(key: string): T | undefined {
    // Check jika ada lazy factory
    const lazyFactory = this._lazyFactories.get(key);
    if (lazyFactory && !this._controllers.has(key)) {
      // Lazy initialize controller
      const controller = lazyFactory();
      this._controllers.set(key, controller);
      controller.onInit();
    }
    
    return this._controllers.get(key) as T;
  }

  /**
   * Public method untuk mendapatkan controller
   */
  public getControllerPublic<T extends Controller>(key: string): T | undefined {
    return this.getController<T>(key);
  }

  /**
   * Mendapatkan controller atau throw error jika tidak ditemukan
   */
  protected findController<T extends Controller>(key: string): T {
    const controller = this.getController<T>(key);
    if (!controller) {
      throw new Error(`Controller dengan key '${key}' tidak ditemukan`);
    }
    return controller;
  }

  /**
   * Remove controller berdasarkan key
   */
  protected removeController(key: string): boolean {
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
  protected getFenix<T extends Controller>(key: string, controllerFactory: () => T): T {
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
  initialize(): void {
    if (this._isInitialized) return;

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
  dispose(): void {
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
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Mendapatkan semua controllers
   */
  get controllers(): Map<string, Controller> {
    return this._controllers;
  }

  /**
   * Abstract method yang harus diimplementasikan untuk mendefinisikan dependencies
   */
  abstract dependencies(): void;
} 