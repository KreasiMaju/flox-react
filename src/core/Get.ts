import { flox } from './Flox';
import { Controller } from './Controller';
import { Binding } from './Binding';

export class FloxUtils {
  // Controller management
  static put<T extends Controller>(key: string, controller: T): T {
    return flox.putController(key, controller);
  }

  static find<T extends Controller>(key: string): T {
    return flox.findController(key);
  }

  static delete(key: string): boolean {
    return flox.removeController(key);
  }

  // Binding management
  static putBinding(key: string, binding: Binding): void {
    flox.putBinding(key, binding);
  }

  static findBinding(key: string): Binding | undefined {
    return flox.getBinding(key);
  }

  static deleteBinding(key: string): boolean {
    return flox.removeBinding(key);
  }

  // Utility methods
  static isRegistered(key: string): boolean {
    return flox.getController(key) !== undefined;
  }

  static isBindingRegistered(key: string): boolean {
    return flox.getBinding(key) !== undefined;
  }

  // Snackbar (simplified)
  static snackbar(message: string, duration: number = 3000): void {
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
  static dialog(title: string, content: string): Promise<boolean> {
    return new Promise((resolve) => {
      const result = confirm(`${title}\n\n${content}`);
      resolve(result);
    });
  }

  // Loading
  static loading(message: string = 'Loading...'): void {
    console.log(`Loading: ${message}`);
    // Implementation bisa di-extend
  }

  static closeLoading(): void {
    console.log('Loading closed');
    // Implementation bisa di-extend
  }
} 