# 🎮 Controllers

Controllers are the heart of Flox - they contain your business logic and state management.

## 🎯 What is a Controller?

A **Controller** is a class that:
- **Manages state** - Holds and updates application data
- **Contains business logic** - Handles user actions and data processing
- **Provides methods** - Actions that components can call
- **Manages lifecycle** - Initialization and cleanup

Think of a Controller as the "brain" of a feature or page in your app.

## 🏗️ Basic Controller Structure

```typescript
import { Controller } from 'flox-react';
import { rxInt, rxString, rxBool } from 'flox-react';

export class UserController extends Controller {
  // 1. State (Rx Variables)
  name = rxString('');
  age = rxInt(0);
  isLoggedIn = rxBool(false);
  
  // 2. Methods (Actions)
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
  
  updateProfile(newName: string, newAge: number) {
    this.name.value = newName;
    this.age.value = newAge;
  }
  
  // 3. Lifecycle Methods
  onInit() {
    console.log('UserController initialized!');
    // Load user data from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.login(user.name, user.age);
    }
  }
  
  onDispose() {
    console.log('UserController disposed!');
    // Save user data to localStorage
    if (this.isLoggedIn.value) {
      localStorage.setItem('user', JSON.stringify({
        name: this.name.value,
        age: this.age.value
      }));
    }
  }
}
```

## 🔍 Controller Anatomy

### 1. State Management

Controllers use **Rx Variables** for reactive state:

```typescript
export class ProductController extends Controller {
  // Simple state
  products = rx<Product[]>([]);
  loading = rxBool(false);
  error = rxString('');
  
  // Computed state
  get totalProducts() {
    return this.products.map(items => items.length);
  }
  
  get expensiveProducts() {
    return this.products.where(items => 
      items.filter(p => p.price > 100)
    );
  }
}
```

### 2. Methods (Actions)

Methods handle user actions and business logic:

```typescript
export class CartController extends Controller {
  items = rx<CartItem[]>([]);
  total = rxInt(0);
  
  // Add item to cart
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.items.value.find(
      item => item.product.id === product.id
    );
    
    if (existingItem) {
      // Update existing item
      const updatedItems = this.items.value.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      this.items.value = updatedItems;
    } else {
      // Add new item
      const newItems = [...this.items.value, { product, quantity }];
      this.items.value = newItems;
    }
    
    this.calculateTotal();
  }
  
  // Remove item from cart
  removeItem(productId: string) {
    const filteredItems = this.items.value.filter(
      item => item.product.id !== productId
    );
    this.items.value = filteredItems;
    this.calculateTotal();
  }
  
  // Clear cart
  clearCart() {
    this.items.value = [];
    this.total.value = 0;
  }
  
  // Private helper method
  private calculateTotal() {
    const total = this.items.value.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    this.total.value = total;
  }
}
```

### 3. Lifecycle Methods

Controllers have two lifecycle methods:

```typescript
export class AppController extends Controller {
  theme = rxString('light');
  language = rxString('en');
  
  onInit() {
    console.log('AppController initialized');
    
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme) this.theme.value = savedTheme;
    if (savedLanguage) this.language.value = savedLanguage;
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', this.theme.value);
  }
  
  onDispose() {
    console.log('AppController disposed');
    
    // Save settings to localStorage
    localStorage.setItem('theme', this.theme.value);
    localStorage.setItem('language', this.language.value);
    
    // Clean up event listeners
    window.removeEventListener('storage', this.handleStorageChange);
  }
  
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'theme') {
      this.theme.value = event.newValue || 'light';
    }
  };
}
```

## 🎯 Controller Types

### 1. Simple Controller

For basic state management:

```typescript
export class CounterController extends Controller {
  count = rxInt(0);
  
  increment() {
    this.count.value++;
  }
  
  decrement() {
    this.count.value--;
  }
  
  reset() {
    this.count.value = 0;
  }
}
```

### 2. Data Controller

For managing data from APIs:

```typescript
export class UserDataController extends Controller {
  users = rx<User[]>([]);
  loading = rxBool(false);
  error = rxString('');
  
  async fetchUsers() {
    this.loading.value = true;
    this.error.value = '';
    
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      this.users.value = data;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading.value = false;
    }
  }
  
  async createUser(userData: CreateUserData) {
    this.loading.value = true;
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      
      const newUser = await response.json();
      this.users.value = [...this.users.value, newUser];
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading.value = false;
    }
  }
}
```

### 3. Form Controller

For managing form state:

```typescript
export class LoginFormController extends Controller {
  email = rxString('');
  password = rxString('');
  rememberMe = rxBool(false);
  loading = rxBool(false);
  errors = rx<Record<string, string>>({});
  
  // Validation
  validateEmail(email: string): string | null {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Email is invalid';
    return null;
  }
  
  validatePassword(password: string): string | null {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }
  
  // Form submission
  async submit() {
    // Clear previous errors
    this.errors.value = {};
    
    // Validate fields
    const emailError = this.validateEmail(this.email.value);
    const passwordError = this.validatePassword(this.password.value);
    
    if (emailError) {
      this.errors.value = { ...this.errors.value, email: emailError };
    }
    
    if (passwordError) {
      this.errors.value = { ...this.errors.value, password: passwordError };
    }
    
    // If validation passes, submit
    if (!emailError && !passwordError) {
      this.loading.value = true;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email.value,
            password: this.password.value,
            rememberMe: this.rememberMe.value
          })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        // Handle successful login
        console.log('Login successful:', data);
      } catch (err) {
        this.errors.value = { 
          ...this.errors.value, 
          general: err instanceof Error ? err.message : 'Login failed' 
        };
      } finally {
        this.loading.value = false;
      }
    }
  }
  
  // Reset form
  reset() {
    this.email.value = '';
    this.password.value = '';
    this.rememberMe.value = false;
    this.errors.value = {};
  }
}
```

## 🔗 Using Controllers in React

### Basic Usage

```typescript
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { UserController } from '../controllers/UserController';

export const UserProfile: React.FC = () => {
  // Create controller instance
  const controller = useMemo(() => new UserController(), []);
  
  // Register with React lifecycle
  const userController = useController(controller);
  
  // Subscribe to state
  const [name] = useRx(userController.name);
  const [age] = useRx(userController.age);
  const [isLoggedIn] = useRx(userController.isLoggedIn);
  
  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h1>Welcome, {name}!</h1>
          <p>Age: {age}</p>
          <button onClick={() => userController.logout()}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h1>Please Login</h1>
          <button onClick={() => userController.login('John', 25)}>
            Login as John
          </button>
        </div>
      )}
    </div>
  );
};
```

### Advanced Usage with Multiple Controllers

```typescript
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { UserController } from '../controllers/UserController';
import { CartController } from '../controllers/CartController';

export const Dashboard: React.FC = () => {
  // Multiple controllers
  const userController = useController(useMemo(() => new UserController(), []));
  const cartController = useController(useMemo(() => new CartController(), []));
  
  // Subscribe to multiple states
  const [userName] = useRx(userController.name);
  const [cartItems] = useRx(cartController.items);
  const [cartTotal] = useRx(cartController.total);
  
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <p>Welcome, {userName}!</p>
      </header>
      
      <main>
        <section>
          <h2>Your Cart</h2>
          <p>Items: {cartItems.length}</p>
          <p>Total: ${cartTotal}</p>
        </section>
      </main>
    </div>
  );
};
```

## 🎯 Best Practices

### 1. Naming Convention

```typescript
// ✅ Good naming
export class UserController extends Controller {}
export class ProductController extends Controller {}
export class CartController extends Controller {}

// ❌ Bad naming
export class User extends Controller {}
export class ProductManager extends Controller {}
export class CartState extends Controller {}
```

### 2. Single Responsibility

```typescript
// ✅ Good - Single responsibility
export class UserController extends Controller {
  // Only handles user-related state and logic
  name = rxString('');
  email = rxString('');
  
  updateProfile(name: string, email: string) {
    this.name.value = name;
    this.email.value = email;
  }
}

export class CartController extends Controller {
  // Only handles cart-related state and logic
  items = rx<CartItem[]>([]);
  
  addItem(item: CartItem) {
    this.items.value = [...this.items.value, item];
  }
}

// ❌ Bad - Multiple responsibilities
export class AppController extends Controller {
  // Handles too many things
  userName = rxString('');
  cartItems = rx<CartItem[]>([]);
  theme = rxString('light');
  // ... many more unrelated states
}
```

### 3. Error Handling

```typescript
export class SafeController extends Controller {
  data = rx<any[]>([]);
  loading = rxBool(false);
  error = rxString('');
  
  async fetchData() {
    this.loading.value = true;
    this.error.value = '';
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.data.value = data;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch data:', err);
    } finally {
      this.loading.value = false;
    }
  }
}
```

### 4. Performance Optimization

```typescript
export class OptimizedController extends Controller {
  // Use computed properties for derived state
  items = rx<Item[]>([]);
  
  get expensiveItems() {
    return this.items.where(items => 
      items.filter(item => item.price > 100)
    );
  }
  
  get totalValue() {
    return this.items.map(items => 
      items.reduce((sum, item) => sum + item.price, 0)
    );
  }
  
  // Batch updates when possible
  updateMultipleItems(updates: Array<{ id: string; data: Partial<Item> }>) {
    const updatedItems = this.items.value.map(item => {
      const update = updates.find(u => u.id === item.id);
      return update ? { ...item, ...update.data } : item;
    });
    
    // Single update instead of multiple
    this.items.value = updatedItems;
  }
}
```

## 🔄 Controller Lifecycle

### Initialization Flow

1. **Controller Created** - `new UserController()`
2. **React Hook Called** - `useController(controller)`
3. **onInit() Called** - Setup, load data, add listeners
4. **Component Renders** - UI shows with initial state
5. **User Interactions** - Methods called, state updates
6. **Component Unmounts** - `onDispose()` called
7. **Cleanup** - Remove listeners, save data

### Example with Full Lifecycle

```typescript
export class LifecycleController extends Controller {
  data = rx<any[]>([]);
  listeners: (() => void)[] = [];
  
  onInit() {
    console.log('🟢 Controller initialized');
    
    // Load initial data
    this.loadData();
    
    // Add event listeners
    const handleResize = () => this.handleWindowResize();
    window.addEventListener('resize', handleResize);
    this.listeners.push(() => window.removeEventListener('resize', handleResize));
    
    // Add storage listener
    const handleStorage = (event: StorageEvent) => this.handleStorageChange(event);
    window.addEventListener('storage', handleStorage);
    this.listeners.push(() => window.removeEventListener('storage', handleStorage));
  }
  
  onDispose() {
    console.log('🔴 Controller disposed');
    
    // Clean up all listeners
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
    
    // Save data
    localStorage.setItem('controller-data', JSON.stringify(this.data.value));
  }
  
  private async loadData() {
    const saved = localStorage.getItem('controller-data');
    if (saved) {
      this.data.value = JSON.parse(saved);
    }
  }
  
  private handleWindowResize() {
    console.log('Window resized');
  }
  
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'controller-data') {
      this.data.value = JSON.parse(event.newValue || '[]');
    }
  }
}
```

## 🆘 Common Issues

### Controller Not Updating UI

```typescript
// ❌ Wrong - Direct access
const count = controller.count.value;

// ✅ Correct - Use useRx hook
const [count] = useRx(controller.count);
```

### Multiple Controller Instances

```typescript
// ❌ Wrong - Creates new instance every render
const controller = new UserController();

// ✅ Correct - Use useMemo
const controller = useMemo(() => new UserController(), []);
```

### Forgetting useController

```typescript
// ❌ Wrong - Controller not registered with React
const controller = useMemo(() => new UserController(), []);
const [name] = useRx(controller.name);

// ✅ Correct - Register with useController
const controller = useMemo(() => new UserController(), []);
const userController = useController(controller);
const [name] = useRx(userController.name);
```

## 🔄 Next Steps

Now that you understand Controllers, explore:

1. **[Rx Variables](./rx-variables.md)** - Master reactive state management
2. **[Bindings](./bindings.md)** - Learn dependency injection
3. **[Advanced Examples](../examples/advanced-examples.md)** - Complex controller patterns
4. **[Performance Optimization](../advanced/performance.md)** - Optimize your controllers

---

**🎉 You've mastered Controllers! Ready to explore Rx Variables?** 🚀 