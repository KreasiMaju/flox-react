# 🎮 Controller API Reference

Complete reference for the `Controller` class - the foundation of Flox state management.

## 📋 Class Overview

```typescript
abstract class Controller {
  // Properties
  readonly isDisposed: boolean;
  readonly subjects: Map<string, Subject<any>>;
  
  // Protected methods
  protected createSubject<T>(key: string, initialValue: T): Subject<T>;
  protected getSubject<T>(key: string): Subject<T> | undefined;
  protected updateSubject<T>(key: string, value: T): void;
  
  // Public methods
  public getSubjectPublic<T>(key: string): Subject<T> | undefined;
  
  // Lifecycle methods
  onInit(): void;
  onDispose(): void;
}
```

## 🔍 Properties

### `isDisposed: boolean` (readonly)

Indicates whether the controller has been disposed.

```typescript
export class MyController extends Controller {
  checkStatus() {
    if (this.isDisposed) {
      console.log('Controller is disposed');
    } else {
      console.log('Controller is active');
    }
  }
}
```

**Type:** `boolean`  
**Default:** `false`  
**Read-only:** Yes

### `subjects: Map<string, Subject<any>>` (readonly)

Map of all subjects managed by this controller.

```typescript
export class MyController extends Controller {
  onInit() {
    this.createSubject('user', null);
    this.createSubject('loading', false);
    
    console.log('Subjects count:', this.subjects.size); // 2
    console.log('Subject keys:', Array.from(this.subjects.keys())); // ['user', 'loading']
  }
}
```

**Type:** `Map<string, Subject<any>>`  
**Read-only:** Yes

## 🛠️ Protected Methods

### `createSubject<T>(key: string, initialValue: T): Subject<T>`

Creates a new reactive subject with the specified key and initial value.

```typescript
export class UserController extends Controller {
  onInit() {
    // Create subjects for complex state
    this.createSubject('user', null);
    this.createSubject('loading', false);
    this.createSubject('error', null);
    this.createSubject('preferences', { theme: 'light', language: 'en' });
  }
}
```

**Parameters:**
- `key: string` - Unique identifier for the subject
- `initialValue: T` - Initial value for the subject

**Returns:** `Subject<T>` - The created subject

**Throws:** Error if subject with the same key already exists

**Example:**
```typescript
export class DataController extends Controller {
  onInit() {
    // Create subjects for different data types
    this.createSubject('users', []);
    this.createSubject('currentUser', null);
    this.createSubject('isLoading', false);
    this.createSubject('errorMessage', '');
  }
  
  async loadUsers() {
    this.updateSubject('isLoading', true);
    this.updateSubject('errorMessage', '');
    
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      this.updateSubject('users', users);
    } catch (error) {
      this.updateSubject('errorMessage', error.message);
    } finally {
      this.updateSubject('isLoading', false);
    }
  }
}
```

### `getSubject<T>(key: string): Subject<T> | undefined`

Retrieves a subject by its key. Returns `undefined` if not found.

```typescript
export class MyController extends Controller {
  onInit() {
    this.createSubject('data', []);
  }
  
  private processData() {
    const dataSubject = this.getSubject<number[]>('data');
    if (dataSubject) {
      const currentData = dataSubject.value;
      // Process data...
    }
  }
}
```

**Parameters:**
- `key: string` - The key of the subject to retrieve

**Returns:** `Subject<T> | undefined` - The subject if found, undefined otherwise

**Example:**
```typescript
export class FormController extends Controller {
  onInit() {
    this.createSubject('formData', { name: '', email: '' });
    this.createSubject('errors', {});
  }
  
  validateForm() {
    const formSubject = this.getSubject<FormData>('formData');
    const errorsSubject = this.getSubject<Record<string, string>>('errors');
    
    if (formSubject && errorsSubject) {
      const formData = formSubject.value;
      const errors: Record<string, string> = {};
      
      if (!formData.name) errors.name = 'Name is required';
      if (!formData.email) errors.email = 'Email is required';
      
      errorsSubject.value = errors;
    }
  }
}
```

### `updateSubject<T>(key: string, value: T): void`

Updates a subject's value. Throws an error if the subject doesn't exist.

```typescript
export class MyController extends Controller {
  onInit() {
    this.createSubject('count', 0);
  }
  
  increment() {
    const currentCount = this.getSubject<number>('count')?.value || 0;
    this.updateSubject('count', currentCount + 1);
  }
}
```

**Parameters:**
- `key: string` - The key of the subject to update
- `value: T` - The new value

**Returns:** `void`

**Throws:** Error if subject with the specified key doesn't exist

**Example:**
```typescript
export class CartController extends Controller {
  onInit() {
    this.createSubject('items', []);
    this.createSubject('total', 0);
  }
  
  addItem(product: Product) {
    const itemsSubject = this.getSubject<Product[]>('items');
    if (itemsSubject) {
      const currentItems = itemsSubject.value;
      const newItems = [...currentItems, product];
      this.updateSubject('items', newItems);
      this.calculateTotal();
    }
  }
  
  private calculateTotal() {
    const itemsSubject = this.getSubject<Product[]>('items');
    if (itemsSubject) {
      const total = itemsSubject.value.reduce((sum, item) => sum + item.price, 0);
      this.updateSubject('total', total);
    }
  }
}
```

## 🔓 Public Methods

### `getSubjectPublic<T>(key: string): Subject<T> | undefined`

Public version of `getSubject` that can be called from outside the controller.

```typescript
export class UserController extends Controller {
  onInit() {
    this.createSubject('user', null);
  }
}

// In React component
const userController = useController(new UserController());
const userSubject = userController.getSubjectPublic<User>('user');
const [user] = useSubject(userSubject!);
```

**Parameters:**
- `key: string` - The key of the subject to retrieve

**Returns:** `Subject<T> | undefined` - The subject if found, undefined otherwise

**Example:**
```typescript
export class ProductController extends Controller {
  onInit() {
    this.createSubject('products', []);
    this.createSubject('selectedProduct', null);
  }
}

// In React component
const productController = useController(new ProductController());

// Get subjects for use with useSubject hook
const productsSubject = productController.getSubjectPublic<Product[]>('products');
const selectedSubject = productController.getSubjectPublic<Product>('selectedProduct');

const [products] = useSubject(productsSubject!);
const [selectedProduct] = useSubject(selectedSubject!);
```

## 🔄 Lifecycle Methods

### `onInit(): void`

Called when the controller is first initialized. Override this method to set up the controller.

```typescript
export class AppController extends Controller {
  onInit() {
    console.log('AppController initialized');
    
    // Create subjects
    this.createSubject('theme', 'light');
    this.createSubject('language', 'en');
    
    // Load saved settings
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme) this.updateSubject('theme', savedTheme);
    if (savedLanguage) this.updateSubject('language', savedLanguage);
    
    // Add event listeners
    window.addEventListener('storage', this.handleStorageChange);
  }
  
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'theme') {
      this.updateSubject('theme', event.newValue || 'light');
    }
  };
}
```

**Called when:** Controller is first used via `useController` hook  
**Override:** Yes  
**Returns:** `void`

### `onDispose(): void`

Called when the controller is being disposed. Override this method to clean up resources.

```typescript
export class AppController extends Controller {
  private listeners: (() => void)[] = [];
  
  onInit() {
    // Add event listeners
    const handleResize = () => this.handleWindowResize();
    window.addEventListener('resize', handleResize);
    this.listeners.push(() => window.removeEventListener('resize', handleResize));
    
    const handleStorage = (event: StorageEvent) => this.handleStorageChange(event);
    window.addEventListener('storage', handleStorage);
    this.listeners.push(() => window.removeEventListener('storage', handleStorage));
  }
  
  onDispose() {
    console.log('AppController disposed');
    
    // Clean up event listeners
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
    
    // Save settings
    const themeSubject = this.getSubject<string>('theme');
    const languageSubject = this.getSubject<string>('language');
    
    if (themeSubject) localStorage.setItem('theme', themeSubject.value);
    if (languageSubject) localStorage.setItem('language', languageSubject.value);
  }
  
  private handleWindowResize() {
    console.log('Window resized');
  }
  
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'theme') {
      this.updateSubject('theme', event.newValue || 'light');
    }
  }
}
```

**Called when:** Component using the controller unmounts  
**Override:** Yes  
**Returns:** `void`

## 🎯 Complete Example

```typescript
import { Controller } from 'flox-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface FormData {
  name: string;
  email: string;
}

export class UserController extends Controller {
  onInit() {
    console.log('UserController initialized');
    
    // Create subjects
    this.createSubject('user', null as User | null);
    this.createSubject('formData', { name: '', email: } as FormData);
    this.createSubject('loading', false);
    this.createSubject('error', '');
    this.createSubject('isEditing', false);
    
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.updateSubject('user', user);
      } catch (error) {
        console.error('Failed to load saved user:', error);
      }
    }
  }
  
  onDispose() {
    console.log('UserController disposed');
    
    // Save user to localStorage
    const userSubject = this.getSubject<User>('user');
    if (userSubject && userSubject.value) {
      localStorage.setItem('user', JSON.stringify(userSubject.value));
    }
  }
  
  async loadUser(userId: string) {
    this.updateSubject('loading', true);
    this.updateSubject('error', '');
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to load user');
      
      const user = await response.json();
      this.updateSubject('user', user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.updateSubject('error', message);
    } finally {
      this.updateSubject('loading', false);
    }
  }
  
  startEditing() {
    const userSubject = this.getSubject<User>('user');
    if (userSubject && userSubject.value) {
      this.updateSubject('formData', {
        name: userSubject.value.name,
        email: userSubject.value.email
      });
      this.updateSubject('isEditing', true);
    }
  }
  
  cancelEditing() {
    this.updateSubject('formData', { name: '', email: '' });
    this.updateSubject('isEditing', false);
    this.updateSubject('error', '');
  }
  
  async saveUser() {
    const formDataSubject = this.getSubject<FormData>('formData');
    if (!formDataSubject) return;
    
    const formData = formDataSubject.value;
    
    // Validate
    if (!formData.name || !formData.email) {
      this.updateSubject('error', 'Name and email are required');
      return;
    }
    
    this.updateSubject('loading', true);
    this.updateSubject('error', '');
    
    try {
      const userSubject = this.getSubject<User>('user');
      const userId = userSubject?.value?.id;
      
      if (!userId) throw new Error('No user ID');
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      const updatedUser = await response.json();
      this.updateSubject('user', updatedUser);
      this.updateSubject('isEditing', false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.updateSubject('error', message);
    } finally {
      this.updateSubject('loading', false);
    }
  }
  
  logout() {
    this.updateSubject('user', null);
    this.updateSubject('formData', { name: '', email: '' });
    this.updateSubject('isEditing', false);
    this.updateSubject('error', '');
    localStorage.removeItem('user');
  }
}
```

## 🆘 Common Issues

### Subject Not Found

```typescript
// ❌ Wrong - Subject might not exist
const subject = this.getSubject('data');
subject.value = newValue; // Error if subject is undefined

// ✅ Correct - Check if subject exists
const subject = this.getSubject('data');
if (subject) {
  subject.value = newValue;
}

// ✅ Better - Use updateSubject
this.updateSubject('data', newValue); // Throws error if subject doesn't exist
```

### Forgetting to Create Subjects

```typescript
// ❌ Wrong - Trying to use subject before creating it
export class MyController extends Controller {
  someMethod() {
    this.updateSubject('data', []); // Error: Subject not found
  }
}

// ✅ Correct - Create subjects in onInit
export class MyController extends Controller {
  onInit() {
    this.createSubject('data', []);
  }
  
  someMethod() {
    this.updateSubject('data', []); // Works
  }
}
```

### Memory Leaks

```typescript
// ❌ Wrong - No cleanup
export class MyController extends Controller {
  onInit() {
    window.addEventListener('resize', this.handleResize);
  }
  
  private handleResize = () => {
    // Handle resize
  };
}

// ✅ Correct - Clean up in onDispose
export class MyController extends Controller {
  onInit() {
    window.addEventListener('resize', this.handleResize);
  }
  
  onDispose() {
    window.removeEventListener('resize', this.handleResize);
  }
  
  private handleResize = () => {
    // Handle resize
  };
}
```

## 🔄 Related APIs

- **[Subject API](./subject.md)** - Reactive state containers
- **[Rx Variables API](./rx.md)** - Reactive variables with operators
- **[Binding API](./binding.md)** - Dependency injection system
- **[React Hooks API](./react-hooks.md)** - React integration

---

**🎉 You've mastered the Controller API! Ready to explore other APIs?** 🚀 