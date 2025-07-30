import { Binding } from './Binding';
import { Controller } from './Controller';

export class Flox {
  private static _instance: Flox;
  private _bindings: Map<string, Binding> = new Map();
  private _globalControllers: Map<string, Controller> = new Map();

  private constructor() {}

  /**
   * Singleton instance
   */
  static get instance(): Flox {
    if (!Flox._instance) {
      Flox._instance = new Flox();
    }
    return Flox._instance;
  }

  /**
   * Put binding dengan key
   */
  putBinding(key: string, binding: Binding): void {
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
  getBinding(key: string): Binding | undefined {
    return this._bindings.get(key);
  }

  /**
   * Remove binding berdasarkan key
   */
  removeBinding(key: string): boolean {
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
  putController<T extends Controller>(key: string, controller: T): T {
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
  getController<T extends Controller>(key: string): T | undefined {
    return this._globalControllers.get(key) as T;
  }

  /**
   * Mendapatkan global controller atau throw error
   */
  findController<T extends Controller>(key: string): T {
    const controller = this.getController<T>(key);
    if (!controller) {
      throw new Error(`Global controller dengan key '${key}' tidak ditemukan`);
    }
    return controller;
  }

  /**
   * Remove global controller
   */
  removeController(key: string): boolean {
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
  dispose(): void {
    this._bindings.forEach(binding => binding.dispose());
    this._bindings.clear();

    this._globalControllers.forEach(controller => controller.onDispose());
    this._globalControllers.clear();
  }

  /**
   * Mendapatkan semua bindings
   */
  get bindings(): Map<string, Binding> {
    return this._bindings;
  }

  /**
   * Mendapatkan semua global controllers
   */
  get globalControllers(): Map<string, Controller> {
    return this._globalControllers;
  }
}

// Export singleton instance
export const flox = Flox.instance; 