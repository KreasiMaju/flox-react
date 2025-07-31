# 🎯 Best Practices

Essential guidelines for writing clean, maintainable Flox code.

## 🏗️ Controller Structure

### ✅ Good Controller Structure

```typescript
export class UserController extends Controller {
  // 1. State (Rx variables)
  user = rx<User | null>(null);
  loading = rxBool(false);
  error = rxString('');
  
  // 2. Computed values
  get isLoggedIn() {
    return this.user.map(user => user !== null);
  }
  
  get userName() {
    return this.user.map(user => user?.name || 'Guest');
  }
  
  // 3. Public methods
  async loginUser(credentials: LoginCredentials) {
    this.setLoading(true);
    this.setError('');
    
    try {
      const user = await this.api.login(credentials);
      this.setUser(user);
    } catch (error) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  logout() {
    this.setUser(null);
    this.setError('');
  }
  
  // 4. Private methods
  private setUser(user: User | null) {
    this.user.value = user;
  }
  
  private setLoading(loading: boolean) {
    this.loading.value = loading;
  }
  
  private setError(error: string) {
    this.error.value = error;
  }
  
  // 5. Lifecycle
  onInit() {
    this.loadSavedUser();
  }
  
  onDispose() {
    this.saveUser();
  }
}
```

### ❌ Avoid These Patterns

```typescript
// ❌ Bad - Too many responsibilities
export class MegaController extends Controller {
  // User state
  user = rx<User | null>(null);
  userLoading = rxBool(false);
  
  // Product state
  products = rx<Product[]>([]);
  productLoading = rxBool(false);
  
  // Cart state
  cart = rx<CartItem[]>([]);
  cartLoading = rxBool(false);
  
  // Too many methods...
}

// ✅ Good - Split into multiple controllers
export class UserController extends Controller {
  user = rx<User | null>(null);
  loading = rxBool(false);
}

export class ProductController extends Controller {
  products = rx<Product[]>([]);
  loading = rxBool(false);
}

export class CartController extends Controller {
  cart = rx<CartItem[]>([]);
  loading = rxBool(false);
}
```

## 🔄 Rx Variable Usage

### ✅ Good Rx Patterns

```typescript
// ✅ Use specific factory functions
const count = rxInt(0);
const name = rxString('');
const active = rxBool(false);

// ✅ Use generic for complex types
const user = rx<User>({ name: '', age: 0 });
const products = rx<Product[]>([]);

// ✅ Use computed values for derived state
get totalPrice() {
  return this.items.map(items => 
    items.reduce((sum, item) => sum + item.price, 0)
  );
}

// ✅ Use update operator for complex updates
user.update(u => ({ ...u, age: u.age + 1 }));
```

### ❌ Avoid These Patterns

```typescript
// ❌ Bad - Use generic for simple types
const count = rx<number>(0);
const name = rx<string>('');

// ❌ Bad - Complex Rx variables
const userState = rx({
  name: '',
  age: 0,
  isLoggedIn: false,
  preferences: {},
  history: []
});

// ❌ Bad - Direct mutations
user.value.name = 'John'; // Doesn't trigger updates

// ❌ Bad - Expensive computations
get expensiveValue() {
  return this.data.map(items => 
    items.filter(item => complexFilter(item))
      .map(item => complexTransform(item))
      .reduce((sum, item) => sum + item.value, 0)
  );
}
```

## 🎣 React Component Patterns

### ✅ Good Component Structure

```typescript
export const UserProfile: React.FC = () => {
  // 1. Create controller
  const controller = useMemo(() => new UserController(), []);
  
  // 2. Register with React
  const userController = useController(controller);
  
  // 3. Subscribe to state
  const [user] = useRx(userController.user);
  const [loading] = useRx(userController.loading);
  const [error] = useRx(userController.error);
  const [isLoggedIn] = useRx(userController.isLoggedIn);
  
  // 4. Event handlers
  const handleLogin = () => {
    userController.loginUser({ email: 'user@example.com', password: 'password' });
  };
  
  const handleLogout = () => {
    userController.logout();
  };
  
  // 5. Render
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Please Login</h1>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};
```

### ❌ Avoid These Patterns

```typescript
// ❌ Bad - Controller created every render
export const UserProfile: React.FC = () => {
  const controller = new UserController(); // New instance every render
  const userController = useController(controller);
  // ...
};

// ❌ Bad - Direct access to Rx values
export const UserProfile: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const userController = useController(controller);
  
  const user = userController.user.value; // Direct access
  return <div>{user?.name}</div>;
};

// ❌ Bad - Missing useController
export const UserProfile: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const [user] = useRx(controller.user); // Missing useController
  // ...
};
```

## 🔗 Binding Patterns

### ✅ Good Binding Structure

```typescript
export class AppBinding extends Binding {
  dependencies() {
    // Normal controllers
    this.putController('user', new UserController());
    this.putController('products', new ProductController());
    
    // Fenix controllers (recreated every access)
    this.putFenix('temp', () => new TempController());
    
    // Permanent controllers (never disposed)
    this.putPermanent('settings', new SettingsController());
    
    // Lazy controllers (initialized on first access)
    this.lazyPut('analytics', () => new AnalyticsController());
  }
}
```

### ✅ Good Component with Binding

```typescript
export const App: React.FC = () => {
  const binding = useBinding('app', new AppBinding());
  
  return (
    <div>
      <UserProfile binding={binding} />
      <ProductList binding={binding} />
    </div>
  );
};

export const UserProfile: React.FC<{ binding: AppBinding }> = ({ binding }) => {
  const userController = useControllerFromBinding<UserController>(binding, 'user');
  const [user] = useRx(userController.user);
  
  return <div>Welcome, {user?.name}!</div>;
};
```

## 🧹 Cleanup Patterns

### ✅ Good Cleanup

```typescript
export class CleanupController extends Controller {
  private listeners: (() => void)[] = [];
  private intervals: number[] = [];
  private subscriptions: (() => void)[] = [];
  
  onInit() {
    // Event listeners
    const handleResize = () => this.handleWindowResize();
    window.addEventListener('resize', handleResize);
    this.listeners.push(() => window.removeEventListener('resize', handleResize));
    
    // Intervals
    const interval = setInterval(() => this.updateData(), 5000);
    this.intervals.push(interval);
    
    // Subscriptions
    const subscription = this.data.subscribe(value => {
      console.log('Data changed:', value);
    });
    this.subscriptions.push(subscription);
  }
  
  onDispose() {
    // Clean up event listeners
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
    
    // Clean up intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    // Clean up subscriptions
    this.subscriptions.forEach(subscription => subscription());
    this.subscriptions = [];
  }
}
```

## 📁 File Organization

### ✅ Good Project Structure

```
src/
├── controllers/
│   ├── UserController.ts
│   ├── ProductController.ts
│   └── CartController.ts
├── bindings/
│   ├── AppBinding.ts
│   └── PageBinding.ts
├── components/
│   ├── UserProfile.tsx
│   ├── ProductList.tsx
│   └── Cart.tsx
├── types/
│   ├── user.ts
│   ├── product.ts
│   └── cart.ts
├── utils/
│   ├── api.ts
│   └── helpers.ts
└── App.tsx
```

### ✅ Good File Naming

```typescript
// ✅ Good - Clear, descriptive names
UserController.ts
ProductListController.ts
ShoppingCartController.ts

// ❌ Bad - Unclear names
Controller.ts
MainController.ts
DataController.ts
```

## 🔒 Type Safety

### ✅ Good Type Definitions

```typescript
// ✅ Good - Specific interfaces
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export class UserController extends Controller {
  user = rx<User | null>(null);
  
  async loginUser(credentials: LoginCredentials): Promise<void> {
    // Implementation
  }
}
```

### ❌ Avoid These Patterns

```typescript
// ❌ Bad - Using any
export class UserController extends Controller {
  user = rx<any>(null);
  
  async loginUser(credentials: any): Promise<any> {
    // Implementation
  }
}

// ❌ Bad - No type definitions
export class UserController extends Controller {
  user = rx(null); // No type information
}
```

## ⚡ Performance Tips

### ✅ Good Performance Patterns

```typescript
// ✅ Good - Memoize expensive computations
export class ProductController extends Controller {
  products = rx<Product[]>([]);
  searchTerm = rxString('');
  
  // Cache filtered results
  get filteredProducts() {
    return this.products.where(products => 
      products.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm.value.toLowerCase())
      )
    );
  }
  
  // Use computed values for derived state
  get totalProducts() {
    return this.products.map(products => products.length);
  }
}

// ✅ Good - Batch updates
export class CartController extends Controller {
  items = rx<CartItem[]>([]);
  
  addMultipleItems(newItems: CartItem[]) {
    // Single update instead of multiple
    this.items.value = [...this.items.value, ...newItems];
  }
}
```

### ❌ Avoid These Patterns

```typescript
// ❌ Bad - Expensive computations on every access
export class ProductController extends Controller {
  products = rx<Product[]>([]);
  
  get expensiveFilteredProducts() {
    // This runs on every access
    return this.products.map(products => 
      products.filter(product => complexFilter(product))
        .map(product => complexTransform(product))
    );
  }
}

// ❌ Bad - Multiple updates
export class CartController extends Controller {
  items = rx<CartItem[]>([]);
  
  addMultipleItems(newItems: CartItem[]) {
    // Multiple updates trigger multiple re-renders
    newItems.forEach(item => {
      this.items.value = [...this.items.value, item];
    });
  }
}
```

## 🧪 Testing Patterns

### ✅ Good Testing Structure

```typescript
// Controller test
describe('UserController', () => {
  let controller: UserController;
  
  beforeEach(() => {
    controller = new UserController();
    controller.onInit();
  });
  
  afterEach(() => {
    controller.onDispose();
  });
  
  it('should login user', async () => {
    await controller.loginUser({ email: 'test@example.com', password: 'password' });
    
    expect(controller.user.value).toBeDefined();
    expect(controller.user.value?.email).toBe('test@example.com');
  });
  
  it('should handle login error', async () => {
    // Mock API to throw error
    jest.spyOn(controller['api'], 'login').mockRejectedValue(new Error('Invalid credentials'));
    
    await controller.loginUser({ email: 'test@example.com', password: 'wrong' });
    
    expect(controller.error.value).toBe('Invalid credentials');
    expect(controller.user.value).toBeNull();
  });
});

// Component test
describe('UserProfile', () => {
  it('should render user name', () => {
    const controller = new UserController();
    controller.user.value = { id: '1', name: 'John', email: 'john@example.com' };
    
    render(
      <UserProfile controller={controller} />
    );
    
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
  });
});
```

## 🔄 Next Steps

1. **[API Reference](../api/controller.md)** - Master the APIs
2. **[Examples](../examples/basic-examples.md)** - See patterns in action
3. **[Performance Guide](./performance.md)** - Optimize your app
4. **[Debugging Guide](./debugging.md)** - Troubleshoot issues

---

**🎉 You're now following Flox best practices!** 🚀 