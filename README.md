# 🚀 Flox - React State Management

**Flox** is a state management library for React that makes state management easy, powerful, and enjoyable!

> **🚨 WARNING:** This is a personal project and still in experimental stage. API may change at any time.

## 📋 Table of Contents
- [Installation](#-installation)
- [Core Concepts](#-core-concepts)
- [Quick Start](#-quick-start)
- [Controller](#-controller)
- [Rx Variables](#-rx-variables)
- [Binding](#-binding)
- [FloxUtils](#-floxutils)
- [Background Workers](#-background-workers)
- [React Hooks](#-react-hooks)
- [Testing Framework](#-testing-framework)
- [Complete Example](#-complete-example)
- [API Reference](#-api-reference)

## 🛠️ Installation

### Quick Install
```bash
# NPM Registry (Recommended)
npm install flox-react

# Or from Git
npm install https://github.com/KreasiMaju/flox-react.git

# Or with other package managers
yarn add flox-react
bun add flox-react
pnpm add flox-react
```

### 📖 Complete Installation Guide
For more detailed installation guide, see [INSTALLATION.md](./INSTALLATION.md) which covers:
- Setup for various project types (CRA, Vite, Next.js)
- Troubleshooting common issues
- Migration from other libraries
- TypeScript setup
- Recommended project structure

## 🎯 Core Concepts

Flox has 4 main concepts:

1. **Controller** - Place to store state and logic
2. **Rx Variables** - Reactive state (automatically updates UI)
3. **Binding** - Way to connect Controller with React
4. **Testing Framework** - Comprehensive testing suite for quality assurance

## ⚡ Quick Start

### 1. Create Controller

```typescript
import { Controller } from 'flox';

export class CounterController extends Controller {
  // Rx variables - reactive state
  count = rxInt(0);
  name = rxString('User');

  increment() {
    this.count.value++; // UI automatically updates!
  }

  updateName(newName: string) {
    this.name.value = newName;
  }
}
```

### 2. Use in React Component

```typescript
import React from 'react';
import { useController, useRx } from 'flox';
import { CounterController } from './CounterController';

function CounterApp() {
  const controller = useController(new CounterController());
  
  // Subscribe to Rx variables
  const [count, setCount] = useRx(controller.count);
  const [name, setName] = useRx(controller.name);

  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Count: {count}</p>
      <button onClick={() => controller.increment()}>
        Increment
      </button>
      <input 
        value={name}
        onChange={(e) => controller.updateName(e.target.value)}
      />
    </div>
  );
}
```

**That's it!** UI will automatically update every time state changes! 🎉

## 🎮 Controller

Controller is where you store state and business logic.

### Basic Controller

```typescript
import { Controller } from 'flox';

export class UserController extends Controller {
  // State
  name = rxString('');
  age = rxInt(0);
  isLoggedIn = rxBool(false);

  // Methods
  login(username: string, userAge: number) {
    this.name.value = username;
    this.age.value = userAge;
    this.isLoggedIn.value = true;
  }

  logout() {
    this.name.value = '';
    this.age.value = 0;
    this.isLoggedIn.value = false;
  }

  // Lifecycle
  onInit() {
    console.log('Controller initialized!');
  }

  onDispose() {
    console.log('Controller disposed!');
  }
}
```

### Controller with Subjects (Advanced)

```typescript
export class AdvancedController extends Controller {
  constructor() {
    super();
    
    // Create subjects for more complex state
    this.createSubject('user', null);
    this.createSubject('loading', false);
    this.createSubject('error', null);
  }

  async fetchUser(id: string) {
    this.updateSubject('loading', true);
    
    try {
      const user = await api.getUser(id);
      this.updateSubject('user', user);
    } catch (error) {
      this.updateSubject('error', error);
    } finally {
      this.updateSubject('loading', false);
    }
  }
}
```

## 🔄 Rx Variables

Rx variables are reactive state. Every change will automatically update the UI!

### Rx Variable Types

```typescript
import { rxInt, rxString, rxBool, rx } from 'flox';

// Specific types
const count = rxInt(0);        // number
const name = rxString('');     // string  
const active = rxBool(false);  // boolean

// Custom types
const user = rx({ name: '', age: 0 });  // object
const items = rx<string[]>([]);         // array
```

### Rx Operators

```typescript
const count = rxInt(5);

// Map - transform value
const doubled = count.map(x => x * 2);
console.log(doubled.value); // 10

// Where - filter value
const isEven = count.map(x => x % 2 === 0);
console.log(isEven.value); // false

// Update - modify value
count.update(x => x + 10);
console.log(count.value); // 15
```

### Rx in Controller

```typescript
export class ProductController extends Controller {
  // Basic Rx
  products = rx<Product[]>([]);
  loading = rxBool(false);
  
  // Computed Rx
  get totalProducts() {
    return this.products.map(items => items.length);
  }
  
  get expensiveProducts() {
    return this.products.where(items => 
      items.filter(p => p.price > 100)
    );
  }

  async loadProducts() {
    this.loading.value = true;
    const data = await api.getProducts();
    this.products.value = data;
    this.loading.value = false;
  }
}
```

## 🔗 Binding

Binding is how you connect Controller with React. There are 4 types:

### 1. Normal Controller
```typescript
// Created once, lives until component unmounts
this.putController('user', new UserController());
```

### 2. Fenix Controller
```typescript
// Recreated every time accessed (fresh state)
this.putFenix('temp', () => new TempController());
```

### 3. Permanent Controller
```typescript
// Never disposed, lives throughout the app
this.putPermanent('app', new AppController());
```

### 4. Lazy Controller
```typescript
// Only created when first accessed
this.lazyPut('settings', () => new SettingsController());
```

### Complete Binding Example

```typescript
import { Binding } from 'flox';

export class AppBinding extends Binding {
  dependencies() {
    // Normal - for main data
    this.putController('user', new UserController());
    
    // Fenix - for temporary data
    this.putFenix('search', () => new SearchController());
    
    // Permanent - for app settings
    this.putPermanent('theme', new ThemeController());
    
    // Lazy - for rarely used features
    this.lazyPut('analytics', () => new AnalyticsController());
  }
}
```

### Use Binding in React

```typescript
import { useBinding } from 'flox';

function App() {
  const binding = useBinding('app', new AppBinding());
  
  // Get controller from binding
  const userController = binding.getControllerPublic('user');
  const themeController = binding.getControllerPublic('theme');
  
  return (
    <div>
      <UserProfile controller={userController} />
      <ThemeToggle controller={themeController} />
    </div>
  );
}
```

## 🛠️ FloxUtils

FloxUtils provides useful utility functions.

### Controller Management

```typescript
import { FloxUtils } from 'flox';

// Register controller
FloxUtils.put('user', new UserController());

// Get controller
const userController = FloxUtils.find<UserController>('user');

// Check if registered
if (FloxUtils.isRegistered('user')) {
  console.log('User controller exists!');
}

// Delete controller
FloxUtils.delete('user');
```

### UI Utilities

```typescript
// Snackbar
FloxUtils.snackbar('Data saved successfully!');

// Dialog
const confirmed = await FloxUtils.dialog('Confirmation', 'Delete data?');
if (confirmed) {
  // User clicked OK
}

// Loading
FloxUtils.loading('Saving data...');
FloxUtils.closeLoading();
```

## ⚙️ Background Workers

Worker for running tasks in the background.

```typescript
import { BackgroundWorker } from 'flox';

// Create worker
BackgroundWorker.create('sync-data', async () => {
  await syncDataToServer();
  FloxUtils.snackbar('Sync completed!');
});

// Start worker
BackgroundWorker.start('sync-data');

// Check status
if (BackgroundWorker.isRunning('sync-data')) {
  console.log('Worker is running');
}

// Stop worker
BackgroundWorker.stop('sync-data');

// Delete worker
BackgroundWorker.delete('sync-data');
```

## 🎣 React Hooks

Flox provides hooks for React integration.

### useController
```typescript
const controller = useController(new UserController());
```

### useRx
```typescript
// Get value and setter
const [count, setCount] = useRx(controller.count);

// Only get value
const count = useRxValue(controller.count);
```

### useSubject
```typescript
const [user, setUser] = useSubject(controller.getSubjectPublic('user'));
```

### useBinding
```typescript
const binding = useBinding('app', new AppBinding());
```

## 🧪 Testing Framework

Flox includes a comprehensive testing framework for quality assurance.

### Quick Test Example

```typescript
import { FloxTestRunner, FloxTestUtils } from 'flox';

describe('UserController', () => {
  let controller: UserController;
  let utils: FloxTestUtils;

  beforeEach(() => {
    utils = new FloxTestUtils();
    utils.setupTestEnvironment();
    controller = FloxTestUtils.createMockController(UserController);
  });

  it('should load user data successfully', async () => {
    const mockUser = FloxTestUtils.createTestUser(1);
    utils.mockApiResponse('/api/user/1', mockUser);

    await controller.loadUser(1);

    expect(controller.user.value).toEqual(mockUser);
    expect(controller.loading.value).toBe(false);
  });
});
```

### Performance Testing

```typescript
const result = await FloxTestRunner.testPerformance(
  async () => {
    for (let i = 0; i < 1000; i++) {
      controller.count.value = i;
    }
  },
  { maxDuration: 100, iterations: 10 }
);
```

### Memory Leak Testing

```typescript
const result = await FloxTestRunner.testMemoryLeaks(
  async () => {
    const controller = new TestController();
    controller.onInit();
    // ... operations ...
    controller.onDispose();
  },
  { maxMemoryLeak: 1024 * 1024, iterations: 50 }
);
```

### Test Suites

```typescript
const testSuite = {
  name: 'UserController Test Suite',
  tests: [
    async () => {
      const result = await FloxTestRunner.testController(
        UserController,
        async (controller, utils) => {
          const mockUser = FloxTestUtils.createTestUser(1);
          utils.mockApiResponse('/api/user/1', mockUser);
          await controller.loadUser(1);
          expect(controller.user.value).toEqual(mockUser);
        }
      );
      if (!result.success) throw new Error(result.error?.message);
    }
  ]
};

const runner = new FloxTestRunner();
const results = await runner.runTestSuite(testSuite);
console.log(runner.generateReport());
```

**📖 For complete testing guide, see [Testing Documentation](./docs/testing/README.md)**

## 📝 Complete Example

### E-commerce App

```typescript
// 1. Controllers
export class CartController extends Controller {
  items = rx<CartItem[]>([]);
  total = rxInt(0);

  addItem(product: Product) {
    const newItems = [...this.items.value, { product, quantity: 1 }];
    this.items.value = newItems;
    this.calculateTotal();
  }

  private calculateTotal() {
    const total = this.items.value.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    this.total.value = total;
  }
}

export class ProductController extends Controller {
  products = rx<Product[]>([]);
  loading = rxBool(false);

  async loadProducts() {
    this.loading.value = true;
    try {
      const data = await api.getProducts();
      this.products.value = data;
    } finally {
      this.loading.value = false;
    }
  }
}

// 2. Binding
export class ShopBinding extends Binding {
  dependencies() {
    this.putController('cart', new CartController());
    this.putController('products', new ProductController());
  }
}

// 3. React Component
function ShopApp() {
  const binding = useBinding('shop', new ShopBinding());
  const cartController = binding.getControllerPublic('cart');
  const productController = binding.getControllerPublic('products');

  const [products] = useRx(productController.products);
  const [cartItems] = useRx(cartController.items);
  const [total] = useRx(cartController.total);
  const [loading] = useRx(productController.loading);

  useEffect(() => {
    productController.loadProducts();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Products</h2>
          {products.map(product => (
            <button 
              key={product.id}
              onClick={() => cartController.addItem(product)}
            >
              Add {product.name} - ${product.price}
            </button>
          ))}
          
          <h2>Cart ({cartItems.length} items)</h2>
          <p>Total: ${total}</p>
        </div>
      )}
    </div>
  );
}
```

## 📚 API Reference

### Controller
```typescript
abstract class Controller {
  protected createSubject<T>(key: string, initialValue: T): Subject<T>
  protected getSubject<T>(key: string): Subject<T> | undefined
  public getSubjectPublic<T>(key: string): Subject<T> | undefined
  protected updateSubject<T>(key: string, value: T): void
  onInit(): void
  onDispose(): void
  get isDisposed(): boolean
  get subjects(): Map<string, Subject<any>>
}
```

### Rx
```typescript
class Rx<T> {
  get value(): T
  set value(newValue: T): void
  map<U>(transform: (value: T) => U): Rx<U>
  where(predicate: (value: T) => boolean): Rx<T>
  update(updater: (value: T) => T): void
  subscribe(observer: (value: T) => void): () => void
  dispose(): void
}

// Factory functions
function rx<T>(initialValue: T): Rx<T>
function rxInt(initialValue: number): Rx<number>
function rxString(initialValue: string): Rx<string>
function rxBool(initialValue: boolean): Rx<boolean>
```

### Binding
```typescript
abstract class Binding {
  protected putController<T extends Controller>(key: string, controller: T): T
  protected putFenix<T extends Controller>(key: string, factory: () => T): void
  protected putPermanent<T extends Controller>(key: string, controller: T): T
  protected lazyPut<T extends Controller>(key: string, factory: () => T): void
  protected getController<T extends Controller>(key: string): T | undefined
  public getControllerPublic<T extends Controller>(key: string): T | undefined
  protected findController<T extends Controller>(key: string): T
  protected removeController(key: string): boolean
  protected getFenix<T extends Controller>(key: string, factory: () => T): T
  initialize(): void
  dispose(): void
  get isInitialized(): boolean
  get controllers(): Map<string, Controller>
  abstract dependencies(): void
}
```

### FloxUtils
```typescript
class FloxUtils {
  static put<T extends Controller>(key: string, controller: T): T
  static find<T extends Controller>(key: string): T
  static delete(key: string): boolean
  static putBinding(key: string, binding: Binding): void
  static findBinding(key: string): Binding | undefined
  static deleteBinding(key: string): boolean
  static isRegistered(key: string): boolean
  static isBindingRegistered(key: string): boolean
  static snackbar(message: string, duration?: number): void
  static dialog(title: string, content: string): Promise<boolean>
  static loading(message?: string): void
  static closeLoading(): void
}
```

### BackgroundWorker
```typescript
class BackgroundWorker {
  static create(key: string, task: () => void | Promise<void>): void
  static start(key: string): void
  static stop(key: string): void
  static delete(key: string): boolean
  static isRunning(key: string): boolean
}
```

### Testing Framework
```typescript
class FloxTestUtils {
  static createMockController<T>(controllerClass: new () => T): T
  static createMockBinding<T>(bindingClass: new () => T): T
  static createTestUser(id: number): User
  static createTestUsers(count: number): User[]
  static waitFor(condition: () => boolean, timeout?: number): Promise<void>
  static waitForRxValue<T>(rx: Rx<T>, expectedValue: T): Promise<void>
  static waitForRxChange<T>(rx: Rx<T>): Promise<T>
  static measureExecutionTime<T>(fn: () => T): { result: T; time: number }
  static measureMemoryUsage<T>(fn: () => T): { result: T; memoryBefore: number; memoryAfter: number }
  setupTestEnvironment(): void
  cleanupTestEnvironment(): void
  mockApiResponse(url: string, response: any, options?: MockApiResponse): void
  mockApiError(url: string, error: string, options?: MockApiError): void
}

class FloxTestRunner {
  static testController<T>(controllerClass: new () => T, testSuite: Function, options?: object): Promise<TestResult>
  static testIntegration(bindingClass: new () => Binding, testSuite: Function, options?: object): Promise<TestResult>
  static testPerformance(testFunction: Function, options?: PerformanceTestOptions): Promise<TestResult>
  static testMemoryLeaks(testFunction: Function, options?: MemoryTestOptions): Promise<TestResult>
  runTestSuite(suite: TestSuite): Promise<TestResult[]>
  generateReport(): string
  getSummary(): TestSummary
}
```

### React Hooks
```typescript
function useController<T extends Controller>(controller: T): T
function useSubject<T>(subject: Subject<T>): [T, (value: T) => void]
function useControllerSubject<T extends Controller, K extends keyof T['subjects']>(
  controller: T, 
  subjectKey: K
): [any, (value: any) => void]
function useRx<T>(rx: Rx<T>): [T, (value: T) => void]
function useRxValue<T>(rx: Rx<T>): T
function useBinding(key: string, binding: Binding): Binding
function useGlobalController<T extends Controller>(key: string, controller: T): T
```

## 🎯 Best Practices

### 1. Project Structure
```
src/
├── controllers/
│   ├── UserController.ts
│   ├── ProductController.ts
│   └── CartController.ts
├── bindings/
│   ├── AppBinding.ts
│   └── FeatureBinding.ts
├── components/
│   ├── UserProfile.tsx
│   └── ProductList.tsx
├── pages/
│   ├── HomePage.tsx
│   └── ShopPage.tsx
└── tests/
    ├── controllers/
    │   ├── UserController.test.ts
    │   └── ProductController.test.ts
    ├── integration/
    │   └── AppBinding.test.ts
    └── performance/
        └── PerformanceTests.test.ts
```

### 2. Naming Convention
```typescript
// Controller: PascalCase + Controller
export class UserController extends Controller {}

// Binding: PascalCase + Binding  
export class AppBinding extends Binding {}

// Rx variables: camelCase
const userName = rxString('');
const isActive = rxBool(false);
```

### 3. Error Handling
```typescript
export class SafeController extends Controller {
  async riskyOperation() {
    try {
      this.updateSubject('loading', true);
      const result = await api.riskyCall();
      this.updateSubject('data', result);
    } catch (error) {
      this.updateSubject('error', error);
      FloxUtils.snackbar('An error occurred!');
    } finally {
      this.updateSubject('loading', false);
    }
  }
}
```

### 4. Performance Tips
```typescript
// ✅ Use lazyPut for rarely used features
this.lazyPut('analytics', () => new AnalyticsController());

// ✅ Use Fenix for temporary data
this.putFenix('search', () => new SearchController());

// ✅ Dispose Rx variables in onDispose
onDispose() {
  this.count.dispose();
  this.name.dispose();
}
```

### 5. Testing Best Practices
```typescript
// ✅ Test controller lifecycle
describe('UserController', () => {
  beforeEach(() => {
    utils = new FloxTestUtils();
    utils.setupTestEnvironment();
    controller = FloxTestUtils.createMockController(UserController);
  });

  afterEach(() => {
    utils.cleanupTestEnvironment();
  });
});

// ✅ Mock API responses
utils.mockApiResponse('/api/user/1', mockUser);
utils.mockApiError('/api/user/999', 'User not found');

// ✅ Test performance and memory
const result = await FloxTestRunner.testPerformance(testFunction, {
  maxDuration: 100,
  maxMemoryIncrease: 1024 * 1024
});

// ✅ Use test suites for complex scenarios
const testSuite = {
  name: 'Complete User Flow',
  tests: [test1, test2, test3]
};
```

## 🚀 Migration from Redux/Zustand

### From Redux
```typescript
// ❌ Redux way
const mapStateToProps = (state) => ({
  count: state.counter.count,
  name: state.user.name
});

const mapDispatchToProps = (dispatch) => ({
  increment: () => dispatch(increment()),
  updateName: (name) => dispatch(updateName(name))
});

// ✅ Flox way
const controller = useController(new CounterController());
const [count] = useRx(controller.count);
const [name] = useRx(controller.name);

// Methods directly from controller
controller.increment();
controller.updateName('New Name');
```

### From Zustand
```typescript
// ❌ Zustand way
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// ✅ Flox way
export class CounterController extends Controller {
  count = rxInt(0);
  increment() {
    this.count.value++;
  }
}
```

## 🤝 Contributing

Contributions are very welcome! Please create issues or pull requests.

## 📄 License

MIT License - free to use for any project!

---

**Flox** - State management that's easy, powerful, and enjoyable! 🎉 