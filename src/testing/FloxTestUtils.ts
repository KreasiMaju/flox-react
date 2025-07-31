import { Rx, rx, rxInt, rxString, rxBool } from '../core/Rx';
import { Controller } from '../core/Controller';
import { Binding } from '../core/Binding';
import { Subject } from '../core/Subject';

export interface MockApiResponse {
  url: string;
  method?: string;
  response: any;
  status?: number;
  delay?: number;
}

export interface MockApiError {
  url: string;
  method?: string;
  error: string;
  status?: number;
  delay?: number;
}

export interface TestEnvironment {
  mockResponses: MockApiResponse[];
  mockErrors: MockApiError[];
  consoleLogs: string[];
  originalFetch: typeof fetch;
  originalConsole: Console;
}

export class FloxTestUtils {
  private testEnvironment: TestEnvironment | null = null;
  private originalFetch: typeof fetch | null = null;
  private originalConsole: Console | null = null;

  /**
   * Create a mock Rx variable
   */
  static createMockRx<T>(initialValue: T): Rx<T> {
    return rx(initialValue);
  }

  /**
   * Create a mock Controller with proper lifecycle
   */
  static createMockController<T extends Controller>(controllerClass: new () => T): T {
    const controller = new controllerClass();
    
    // Mock lifecycle methods if they don't exist
    if (!controller.onInit) {
      controller.onInit = jest.fn();
    }
    if (!controller.onDispose) {
      controller.onDispose = jest.fn();
    }
    
    return controller;
  }

  /**
   * Create a mock Binding
   */
  static createMockBinding<T extends Binding>(bindingClass: new () => T): T {
    const binding = new bindingClass();
    
    // Mock dependencies method if it doesn't exist
    if (!binding.dependencies) {
      binding.dependencies = jest.fn();
    }
    
    return binding;
  }

  /**
   * Setup test environment with mocks
   */
  setupTestEnvironment(): void {
    this.testEnvironment = {
      mockResponses: [],
      mockErrors: [],
      consoleLogs: [],
      originalFetch: fetch,
      originalConsole: console
    };

    // Mock fetch
    this.originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(this.mockFetch.bind(this));

    // Mock console
    this.originalConsole = global.console;
    global.console = {
      ...console,
      log: jest.fn().mockImplementation((...args) => {
        this.testEnvironment!.consoleLogs.push(args.join(' '));
        this.originalConsole!.log(...args);
      }),
      warn: jest.fn().mockImplementation((...args) => {
        this.testEnvironment!.consoleLogs.push(`WARN: ${args.join(' ')}`);
        this.originalConsole!.warn(...args);
      }),
      error: jest.fn().mockImplementation((...args) => {
        this.testEnvironment!.consoleLogs.push(`ERROR: ${args.join(' ')}`);
        this.originalConsole!.error(...args);
      })
    };
  }

  /**
   * Cleanup test environment
   */
  cleanupTestEnvironment(): void {
    if (this.originalFetch) {
      global.fetch = this.originalFetch;
      this.originalFetch = null;
    }

    if (this.originalConsole) {
      global.console = this.originalConsole;
      this.originalConsole = null;
    }

    this.testEnvironment = null;
  }

  /**
   * Mock API response
   */
  mockApiResponse(url: string, response: any, options: Partial<MockApiResponse> = {}): void {
    if (!this.testEnvironment) {
      throw new Error('Test environment not set up. Call setupTestEnvironment() first.');
    }

    this.testEnvironment.mockResponses.push({
      url,
      method: options.method || 'GET',
      response,
      status: options.status || 200,
      delay: options.delay || 0
    });
  }

  /**
   * Mock API error
   */
  mockApiError(url: string, error: string, options: Partial<MockApiError> = {}): void {
    if (!this.testEnvironment) {
      throw new Error('Test environment not set up. Call setupTestEnvironment() first.');
    }

    this.testEnvironment.mockErrors.push({
      url,
      method: options.method || 'GET',
      error,
      status: options.status || 500,
      delay: options.delay || 0
    });
  }

  /**
   * Wait for async operations to complete
   */
  static async waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout waiting for condition after ${timeout}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Wait for Rx variable to have specific value
   */
  static async waitForRxValue<T>(rx: Rx<T>, expectedValue: T, timeout: number = 5000): Promise<void> {
    return this.waitFor(() => rx.value === expectedValue, timeout);
  }

  /**
   * Wait for Rx variable to change
   */
  static async waitForRxChange<T>(rx: Rx<T>, timeout: number = 5000): Promise<T> {
    const initialValue = rx.value;
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const subscription = rx.subscribe((newValue) => {
        if (newValue !== initialValue) {
          subscription();
          resolve(newValue);
        }
      });
      
      setTimeout(() => {
        subscription();
        reject(new Error(`Timeout waiting for Rx change after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Capture console logs
   */
  captureConsole(): { logs: string[], restore: () => void } {
    if (!this.testEnvironment) {
      throw new Error('Test environment not set up. Call setupTestEnvironment() first.');
    }

    const logs = [...this.testEnvironment.consoleLogs];
    
    return {
      logs,
      restore: () => {
        this.testEnvironment!.consoleLogs = [];
      }
    };
  }

  /**
   * Get captured console logs
   */
  getConsoleLogs(): string[] {
    if (!this.testEnvironment) {
      throw new Error('Test environment not set up. Call setupTestEnvironment() first.');
    }

    return [...this.testEnvironment.consoleLogs];
  }

  /**
   * Clear console logs
   */
  clearConsoleLogs(): void {
    if (this.testEnvironment) {
      this.testEnvironment.consoleLogs = [];
    }
  }

  /**
   * Mock fetch implementation
   */
  private async mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (!this.testEnvironment) {
      return this.originalFetch!(input, init);
    }

    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    // Check for mock errors first
    const mockError = this.testEnvironment.mockErrors.find(
      error => error.url === url && error.method === method
    );

    if (mockError) {
      if (mockError.delay) {
        await new Promise(resolve => setTimeout(resolve, mockError.delay));
      }

      return new Response(JSON.stringify({ error: mockError.error }), {
        status: mockError.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for mock responses
    const mockResponse = this.testEnvironment.mockResponses.find(
      response => response.url === url && response.method === method
    );

    if (mockResponse) {
      if (mockResponse.delay) {
        await new Promise(resolve => setTimeout(resolve, mockResponse.delay));
      }

      return new Response(JSON.stringify(mockResponse.response), {
        status: mockResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback to original fetch
    return this.originalFetch!(input, init);
  }

  /**
   * Create test data
   */
  static createTestUser(id: number = 1) {
    return {
      id,
      name: `Test User ${id}`,
      email: `user${id}@test.com`,
      avatar: `https://example.com/avatar${id}.jpg`,
      createdAt: new Date().toISOString()
    };
  }

  static createTestUsers(count: number) {
    return Array.from({ length: count }, (_, i) => this.createTestUser(i + 1));
  }

  /**
   * Measure execution time
   */
  static measureExecutionTime<T>(fn: () => T): { result: T; time: number } {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    return {
      result,
      time: endTime - startTime
    };
  }

  /**
   * Measure memory usage
   */
  static measureMemoryUsage<T>(fn: () => T): { result: T; memoryBefore: number; memoryAfter: number } {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      throw new Error('Memory measurement not available in this environment');
    }

    const memoryBefore = (performance as any).memory.usedJSHeapSize;
    const result = fn();
    const memoryAfter = (performance as any).memory.usedJSHeapSize;

    return {
      result,
      memoryBefore,
      memoryAfter
    };
  }

  /**
   * Get memory usage
   */
  static getMemoryUsage(): number {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return 0;
    }

    return (performance as any).memory.usedJSHeapSize;
  }

  /**
   * Force garbage collection (if available)
   */
  static forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Create a test controller with common patterns
   */
  static createTestController() {
    class TestController extends Controller {
      count = rxInt(0);
      name = rxString('');
      active = rxBool(false);
      data = rx<any[]>([]);
      loading = rxBool(false);
      error = rxString('');

      increment() {
        this.count.value++;
      }

      decrement() {
        this.count.value--;
      }

      setName(name: string) {
        this.name.value = name;
      }

      toggleActive() {
        this.active.value = !this.active.value;
      }

      async loadData() {
        this.loading.value = true;
        this.error.value = '';
        
        try {
          const response = await fetch('/api/data');
          const data = await response.json();
          this.data.value = data;
        } catch (err) {
          this.error.value = err instanceof Error ? err.message : 'Unknown error';
        } finally {
          this.loading.value = false;
        }
      }

      addItem(item: any) {
        this.data.value = [...this.data.value, item];
      }

      removeItem(id: string) {
        this.data.value = this.data.value.filter(item => item.id !== id);
      }

      clearData() {
        this.data.value = [];
      }
    }

    return TestController;
  }
}

// Export singleton instance
export const floxTestUtils = new FloxTestUtils(); 