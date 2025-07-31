# 🚀 Flox - React State Management

**Flox** adalah state management library untuk React yang membuat state management menjadi mudah, powerful, dan menyenangkan!

> **🚨 WARNING:** Ini adalah project pribadi dan masih dalam tahap experimental. API mungkin berubah sewaktu-waktu.

## 📋 Daftar Isi
- [Instalasi](#-instalasi)
- [Konsep Dasar](#-konsep-dasar)
- [Quick Start](#-quick-start)
- [Controller](#-controller)
- [Rx Variables](#-rx-variables)
- [Binding](#-binding)
- [Get Utilities](#-get-utilities)
- [Background Workers](#-background-workers)
- [React Hooks](#-react-hooks)
- [Contoh Lengkap](#-contoh-lengkap)
- [API Reference](#-api-reference)

## 🛠️ Instalasi

### Quick Install
```bash
# NPM Registry (Recommended)
npm install flox-react

# Atau dari Git
npm install https://github.com/KreasiMaju/flox-react.git

# Atau dengan package manager lain
yarn add @flox/react
bun add @flox/react
pnpm add @flox/react
```

### 📖 Panduan Instalasi Lengkap
Untuk panduan instalasi yang lebih detail, lihat [INSTALLATION.md](./INSTALLATION.md) yang mencakup:
- Setup untuk berbagai project types (CRA, Vite, Next.js)
- Troubleshooting common issues
- Migration dari library lain
- TypeScript setup
- Project structure yang direkomendasikan

## 🎯 Konsep Dasar

Flox memiliki 3 konsep utama:

1. **Controller** - Tempat menyimpan state dan logic
2. **Rx Variables** - State yang reactive (otomatis update UI)
3. **Binding** - Cara menghubungkan Controller dengan React

## ⚡ Quick Start

### 1. Buat Controller

```typescript
import { Controller } from 'flox';

export class CounterController extends Controller {
  // Rx variables - state yang reactive
  count = rxInt(0);
  name = rxString('User');

  increment() {
    this.count.value++; // UI otomatis update!
  }

  updateName(newName: string) {
    this.name.value = newName;
  }
}
```

### 2. Gunakan di React Component

```typescript
import React from 'react';
import { useController, useRx } from 'flox';
import { CounterController } from './CounterController';

function CounterApp() {
  const controller = useController(new CounterController());
  
  // Subscribe ke Rx variables
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

**Itu saja!** UI akan otomatis update setiap kali state berubah! 🎉

## 🎮 Controller

Controller adalah tempat menyimpan state dan business logic.

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

### Controller dengan Subjects (Advanced)

```typescript
export class AdvancedController extends Controller {
  constructor() {
    super();
    
    // Buat subjects untuk state yang lebih kompleks
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

Rx variables adalah state yang reactive. Setiap perubahan akan otomatis update UI!

### Tipe Rx Variables

```typescript
import { rxInt, rxString, rxBool, rx } from 'flox';

// Tipe spesifik
const count = rxInt(0);        // number
const name = rxString('');     // string  
const active = rxBool(false);  // boolean

// Tipe custom
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

### Rx di Controller

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

Binding adalah cara menghubungkan Controller dengan React. Ada 4 tipe:

### 1. Normal Controller
```typescript
// Dibuat sekali, hidup sampai component unmount
this.putController('user', new UserController());
```

### 2. Fenix Controller
```typescript
// Dibuat ulang setiap kali diakses (fresh state)
this.putFenix('temp', () => new TempController());
```

### 3. Permanent Controller
```typescript
// Tidak pernah di-dispose, hidup selama aplikasi
this.putPermanent('app', new AppController());
```

### 4. Lazy Controller
```typescript
// Hanya dibuat saat pertama kali diakses
this.lazyPut('settings', () => new SettingsController());
```

### Contoh Binding Lengkap

```typescript
import { Binding } from 'flox';

export class AppBinding extends Binding {
  dependencies() {
    // Normal - untuk data utama
    this.putController('user', new UserController());
    
    // Fenix - untuk data temporary
    this.putFenix('search', () => new SearchController());
    
    // Permanent - untuk app settings
    this.putPermanent('theme', new ThemeController());
    
    // Lazy - untuk fitur yang jarang dipakai
    this.lazyPut('analytics', () => new AnalyticsController());
  }
}
```

### Gunakan Binding di React

```typescript
import { useBinding } from 'flox';

function App() {
  const binding = useBinding('app', new AppBinding());
  
  // Ambil controller dari binding
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

## 🛠️ Get Utilities

Get menyediakan utility functions yang berguna.

### Controller Management

```typescript
import { Get } from 'flox';

// Register controller
Get.put('user', new UserController());

// Get controller
const userController = Get.find<UserController>('user');

// Check if registered
if (Get.isRegistered('user')) {
  console.log('User controller exists!');
}

// Delete controller
Get.delete('user');
```

### UI Utilities

```typescript
// Snackbar
Get.snackbar('Data berhasil disimpan!');

// Dialog
const confirmed = await Get.dialog('Konfirmasi', 'Hapus data?');
if (confirmed) {
  // User klik OK
}

// Loading
Get.loading('Menyimpan data...');
Get.closeLoading();
```

## ⚙️ Background Workers

Worker untuk menjalankan task di background.

```typescript
import { BackgroundWorker } from 'flox';

// Buat worker
BackgroundWorker.create('sync-data', async () => {
  await syncDataToServer();
  Get.snackbar('Sync selesai!');
});

// Start worker
BackgroundWorker.start('sync-data');

// Check status
if (BackgroundWorker.isRunning('sync-data')) {
  console.log('Worker sedang berjalan');
}

// Stop worker
BackgroundWorker.stop('sync-data');

// Delete worker
BackgroundWorker.delete('sync-data');
```

## 🎣 React Hooks

Flox menyediakan hooks untuk React integration.

### useController
```typescript
const controller = useController(new UserController());
```

### useRx
```typescript
// Get value dan setter
const [count, setCount] = useRx(controller.count);

// Hanya get value
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

## 📝 Contoh Lengkap

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

### Get
```typescript
class Get {
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

### 1. Struktur Project
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
└── pages/
    ├── HomePage.tsx
    └── ShopPage.tsx
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
      Get.snackbar('Terjadi kesalahan!');
    } finally {
      this.updateSubject('loading', false);
    }
  }
}
```

### 4. Performance Tips
```typescript
// ✅ Gunakan lazyPut untuk fitur yang jarang dipakai
this.lazyPut('analytics', () => new AnalyticsController());

// ✅ Gunakan Fenix untuk data temporary
this.putFenix('search', () => new SearchController());

// ✅ Dispose Rx variables di onDispose
onDispose() {
  this.count.dispose();
  this.name.dispose();
}
```

## 🚀 Migration dari Redux/Zustand

### Dari Redux
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

// Methods langsung dari controller
controller.increment();
controller.updateName('New Name');
```

### Dari Zustand
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

Kontribusi sangat welcome! Silakan buat issue atau pull request.

## 📄 License

MIT License - bebas digunakan untuk project apapun!

---

**Flox** - State management yang mudah, powerful, dan menyenangkan! 🎉 