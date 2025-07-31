# 🔄 Rx Variables API Reference

Complete reference for Rx Variables - reactive state containers with powerful operators.

## 📋 Class Overview

```typescript
class Rx<T> {
  // Properties
  get value(): T;
  set value(newValue: T): void;
  readonly isDisposed: boolean;
  readonly observerCount: number;
  
  // Operators
  map<U>(transform: (value: T) => U): Rx<U>;
  where(predicate: (value: T) => boolean): Rx<T>;
  update(updater: (value: T) => T): void;
  
  // Subscription
  subscribe(observer: (value: T) => void): () => void;
  
  // Lifecycle
  dispose(): void;
}

// Factory functions
function rx<T>(initialValue: T): Rx<T>;
function rxInt(initialValue: number): Rx<number>;
function rxString(initialValue: string): Rx<string>;
function rxBool(initialValue: boolean): Rx<boolean>;
```

## 🏗️ Factory Functions

### `rx<T>(initialValue: T): Rx<T>`

Creates a generic Rx variable with the specified initial value.

```typescript
import { rx } from 'flox-react';

// Object
const user = rx({ name: 'John', age: 25 });

// Array
const items = rx<string[]>([]);

// Custom type
interface Product {
  id: string;
  name: string;
  price: number;
}
const product = rx<Product | null>(null);

// Any type
const data = rx<any>(null);
```

**Parameters:**
- `initialValue: T` - The initial value for the Rx variable

**Returns:** `Rx<T>` - A new Rx variable instance

**Example:**
```typescript
// Create Rx variables for different data types
const user = rx({ name: '', email: '', age: 0 });
const products = rx<Product[]>([]);
const settings = rx({ theme: 'light', language: 'en' });

// Update values
user.value = { name: 'John', email: 'john@example.com', age: 25 };
products.value = [{ id: '1', name: 'Product 1', price: 100 }];
settings.value = { theme: 'dark', language: 'es' };
```

### `rxInt(initialValue: number): Rx<number>`

Creates an Rx variable specifically for integer values.

```typescript
import { rxInt } from 'flox-react';

const count = rxInt(0);
const price = rxInt(100);
const quantity = rxInt(1);
```

**Parameters:**
- `initialValue: number` - The initial integer value

**Returns:** `Rx<number>` - A new Rx variable for numbers

**Example:**
```typescript
const counter = rxInt(0);
const maxCount = rxInt(100);

// Increment
counter.value++;

// Decrement
counter.value--;

// Reset
counter.value = 0;

// Set to maximum
counter.value = maxCount.value;
```

### `rxString(initialValue: string): Rx<string>`

Creates an Rx variable specifically for string values.

```typescript
import { rxString } from 'flox-react';

const name = rxString('');
const email = rxString('user@example.com');
const message = rxString('Hello World');
```

**Parameters:**
- `initialValue: string` - The initial string value

**Returns:** `Rx<string>` - A new Rx variable for strings

**Example:**
```typescript
const username = rxString('');
const searchTerm = rxString('');

// Update values
username.value = 'john_doe';
searchTerm.value = 'react';

// Clear values
username.value = '';
searchTerm.value = '';
```

### `rxBool(initialValue: boolean): Rx<boolean>`

Creates an Rx variable specifically for boolean values.

```typescript
import { rxBool } from 'flox-react';

const isLoggedIn = rxBool(false);
const isLoading = rxBool(true);
const hasError = rxBool(false);
```

**Parameters:**
- `initialValue: boolean` - The initial boolean value

**Returns:** `Rx<boolean>` - A new Rx variable for booleans

**Example:**
```typescript
const isVisible = rxBool(false);
const isEnabled = rxBool(true);

// Toggle values
isVisible.value = !isVisible.value;
isEnabled.value = !isEnabled.value;

// Set specific values
isVisible.value = true;
isEnabled.value = false;
```

## 🔍 Properties

### `value: T`

Gets or sets the current value of the Rx variable.

```typescript
const count = rxInt(5);

// Get value
console.log(count.value); // 5

// Set value
count.value = 10;
console.log(count.value); // 10
```

**Type:** `T` - The type of the Rx variable  
**Access:** Read/Write

### `isDisposed: boolean` (readonly)

Indicates whether the Rx variable has been disposed.

```typescript
const data = rx<string>('initial');

console.log(data.isDisposed); // false

data.dispose();
console.log(data.isDisposed); // true
```

**Type:** `boolean`  
**Default:** `false`  
**Read-only:** Yes

### `observerCount: number` (readonly)

Returns the number of active observers (subscribers).

```typescript
const count = rxInt(0);

console.log(count.observerCount); // 0

const unsubscribe1 = count.subscribe(console.log);
console.log(count.observerCount); // 1

const unsubscribe2 = count.subscribe(console.log);
console.log(count.observerCount); // 2

unsubscribe1();
console.log(count.observerCount); // 1

unsubscribe2();
console.log(count.observerCount); // 0
```

**Type:** `number`  
**Read-only:** Yes

## 🛠️ Operators

### `map<U>(transform: (value: T) => U): Rx<U>`

Transforms the value using a function without changing the original Rx variable.

```typescript
const count = rxInt(5);

// Transform to string
const countText = count.map(x => `Count: ${x}`);
console.log(countText.value); // "Count: 5"

// Transform to boolean
const isEven = count.map(x => x % 2 === 0);
console.log(isEven.value); // false

// Transform to object
const countInfo = count.map(x => ({ value: x, doubled: x * 2 }));
console.log(countInfo.value); // { value: 5, doubled: 10 }

// Update original
count.value = 10;
console.log(countText.value); // "Count: 10"
console.log(isEven.value); // true
console.log(countInfo.value); // { value: 10, doubled: 20 }
```

**Parameters:**
- `transform: (value: T) => U` - Function to transform the value

**Returns:** `Rx<U>` - A new Rx variable with the transformed value

**Example:**
```typescript
const user = rx({ name: 'John', age: 25 });

// Transform to display name
const displayName = user.map(u => u.name.toUpperCase());
console.log(displayName.value); // "JOHN"

// Transform to age status
const ageStatus = user.map(u => u.age >= 18 ? 'adult' : 'minor');
console.log(ageStatus.value); // "adult"

// Transform to greeting
const greeting = user.map(u => `Hello, ${u.name}! You are ${u.age} years old.`);
console.log(greeting.value); // "Hello, John! You are 25 years old."

// Update user
user.value = { name: 'Jane', age: 16 };
console.log(displayName.value); // "JANE"
console.log(ageStatus.value); // "minor"
console.log(greeting.value); // "Hello, Jane! You are 16 years old."
```

### `where(predicate: (value: T) => boolean): Rx<T>`

Filters the value based on a predicate function. For arrays, filters the array elements.

```typescript
const numbers = rx<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Filter even numbers
const evenNumbers = numbers.where(nums => nums.filter(n => n % 2 === 0));
console.log(evenNumbers.value); // [2, 4, 6, 8, 10]

// Filter numbers greater than 5
const largeNumbers = numbers.where(nums => nums.filter(n => n > 5));
console.log(largeNumbers.value); // [6, 7, 8, 9, 10]

// Update original
numbers.value = [11, 12, 13, 14, 15];
console.log(evenNumbers.value); // [12, 14]
console.log(largeNumbers.value); // [11, 12, 13, 14, 15]
```

**Parameters:**
- `predicate: (value: T) => boolean` - Function to filter the value

**Returns:** `Rx<T>` - A new Rx variable with the filtered value

**Example:**
```typescript
const products = rx<Product[]>([
  { id: '1', name: 'Laptop', price: 1000, category: 'electronics' },
  { id: '2', name: 'Book', price: 20, category: 'books' },
  { id: '3', name: 'Phone', price: 500, category: 'electronics' },
  { id: '4', name: 'Pen', price: 5, category: 'office' }
]);

// Filter expensive products
const expensiveProducts = products.where(items => 
  items.filter(p => p.price > 100)
);
console.log(expensiveProducts.value); // [Laptop, Phone]

// Filter electronics
const electronics = products.where(items => 
  items.filter(p => p.category === 'electronics')
);
console.log(electronics.value); // [Laptop, Phone]

// Filter by multiple criteria
const affordableElectronics = products.where(items => 
  items.filter(p => p.category === 'electronics' && p.price < 600)
);
console.log(affordableElectronics.value); // [Phone]

// Update products
products.value = [
  { id: '5', name: 'Tablet', price: 300, category: 'electronics' },
  { id: '6', name: 'Notebook', price: 15, category: 'office' }
];

console.log(expensiveProducts.value); // [Tablet]
console.log(electronics.value); // [Tablet]
console.log(affordableElectronics.value); // [Tablet]
```

### `update(updater: (value: T) => T): void`

Updates the value using a function that receives the current value and returns the new value.

```typescript
const count = rxInt(5);

// Increment by 1
count.update(x => x + 1);
console.log(count.value); // 6

// Double the value
count.update(x => x * 2);
console.log(count.value); // 12

// Complex update
const user = rx({ name: 'John', age: 25 });

user.update(u => ({ ...u, age: u.age + 1 }));
console.log(user.value); // { name: 'John', age: 26 }

user.update(u => ({ ...u, name: 'Jane' }));
console.log(user.value); // { name: 'Jane', age: 26 }
```

**Parameters:**
- `updater: (value: T) => T` - Function that receives current value and returns new value

**Returns:** `void`

**Example:**
```typescript
const cart = rx<CartItem[]>([]);

// Add item
cart.update(items => [...items, { id: '1', name: 'Product', quantity: 1 }]);

// Update quantity
cart.update(items => 
  items.map(item => 
    item.id === '1' 
      ? { ...item, quantity: item.quantity + 1 }
      : item
  )
);

// Remove item
cart.update(items => items.filter(item => item.id !== '1'));

// Clear cart
cart.update(() => []);
```

## 📡 Subscription

### `subscribe(observer: (value: T) => void): () => void`

Subscribes to value changes and returns an unsubscribe function.

```typescript
const count = rxInt(0);

// Subscribe to changes
const unsubscribe = count.subscribe((newValue) => {
  console.log('Count changed to:', newValue);
});

// Change value (triggers subscription)
count.value = 5; // Logs: "Count changed to: 5"
count.value = 10; // Logs: "Count changed to: 10"

// Unsubscribe when done
unsubscribe();

// Change value (no longer triggers subscription)
count.value = 15; // No log output
```

**Parameters:**
- `observer: (value: T) => void` - Function called when value changes

**Returns:** `() => void` - Function to unsubscribe

**Example:**
```typescript
const user = rx({ name: '', email: '' });

// Subscribe to user changes
const unsubscribe = user.subscribe((newUser) => {
  console.log('User updated:', newUser);
  
  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(newUser));
});

// Update user
user.value = { name: 'John', email: 'john@example.com' };
// Logs: "User updated: { name: 'John', email: 'john@example.com' }"

// Update again
user.value = { name: 'Jane', email: 'jane@example.com' };
// Logs: "User updated: { name: 'Jane', email: 'jane@example.com' }"

// Unsubscribe
unsubscribe();
```

## 🔄 Lifecycle

### `dispose(): void`

Disposes the Rx variable, cleaning up all subscriptions and preventing further updates.

```typescript
const data = rx<string>('initial');

// Subscribe
const unsubscribe = data.subscribe(console.log);

// Dispose
data.dispose();

console.log(data.isDisposed); // true
console.log(data.observerCount); // 0

// Further updates are ignored
data.value = 'new value'; // No effect
```

**Returns:** `void`

**Example:**
```typescript
export class CleanupController extends Controller {
  private rxVariables: Rx<any>[] = [];
  
  onInit() {
    // Create Rx variables
    const count = rxInt(0);
    const name = rxString('');
    const active = rxBool(false);
    
    this.rxVariables.push(count, name, active);
  }
  
  onDispose() {
    // Clean up all Rx variables
    this.rxVariables.forEach(rx => rx.dispose());
    this.rxVariables = [];
  }
}
```

## 🎯 Advanced Patterns

### Chaining Operators

```typescript
const numbers = rx<number[]>([1, 2, 3, 4, 5]);

// Chain multiple operations
const result = numbers
  .where(nums => nums.filter(n => n > 2))  // [3, 4, 5]
  .map(nums => nums.map(n => n * 2))       // [6, 8, 10]
  .map(nums => nums.reduce((sum, n) => sum + n, 0)); // 24

console.log(result.value); // 24

// Update original
numbers.value = [10, 20, 30];
console.log(result.value); // 120 (30*2 + 20*2 + 10*2)
```

### Computed Values

```typescript
const price = rxInt(100);
const quantity = rxInt(3);
const discount = rxInt(10);

// Computed total
const total = price.map(p => 
  p * quantity.value * (1 - discount.value / 100)
);

console.log(total.value); // 270 (100 * 3 * 0.9)

// Update any value
price.value = 150;
console.log(total.value); // 405 (150 * 3 * 0.9)
```

### Conditional Logic

```typescript
const user = rx({ name: 'John', age: 25, isPremium: false });

// Conditional computed value
const greeting = user.map(u => 
  u.isPremium 
    ? `Welcome back, ${u.name}! You have premium access.`
    : `Hello ${u.name}. Upgrade to premium for more features.`
);

console.log(greeting.value); // "Hello John. Upgrade to premium for more features."

// Update user
user.update(u => ({ ...u, isPremium: true }));
console.log(greeting.value); // "Welcome back, John! You have premium access."
```

## 🆘 Common Issues

### Rx Variable Not Updating UI

```typescript
// ❌ Wrong - Direct access
const count = controller.count.value;

// ✅ Correct - Use useRx hook
const [count] = useRx(controller.count);
```

### Memory Leaks

```typescript
// ❌ Wrong - No cleanup
const subscription = rx.subscribe(console.log);

// ✅ Correct - Clean up subscription
const subscription = rx.subscribe(console.log);
// ... later
subscription(); // Call to unsubscribe
```

### Complex Computed Values

```typescript
// ❌ Wrong - Complex computed value
const complexValue = rx1.map(v1 => 
  rx2.map(v2 => 
    rx3.map(v3 => 
      // Very complex calculation
    )
  )
);

// ✅ Correct - Break down into simpler parts
const intermediate1 = rx1.map(v1 => /* simple calculation */);
const intermediate2 = rx2.map(v2 => /* simple calculation */);
const finalValue = intermediate1.map(i1 => 
  intermediate2.map(i2 => /* combine results */)
);
```

## 🔄 Performance Tips

### 1. Avoid Unnecessary Computations

```typescript
// ❌ Bad - Computes on every change
const expensiveValue = data.map(items => 
  items.filter(item => complexFilter(item))
    .map(item => complexTransform(item))
    .reduce((sum, item) => sum + item.value, 0)
);

// ✅ Good - Cache expensive computations
const filteredData = data.where(items => 
  items.filter(item => complexFilter(item))
);

const expensiveValue = filteredData.map(items => 
  items.map(item => complexTransform(item))
    .reduce((sum, item) => sum + item.value, 0)
);
```

### 2. Use Appropriate Operators

```typescript
// ✅ Good - Use where for filtering
const evenNumbers = numbers.where(nums => 
  nums.filter(n => n % 2 === 0)
);

// ✅ Good - Use map for transformation
const doubledNumbers = numbers.map(nums => 
  nums.map(n => n * 2)
);

// ✅ Good - Use update for modifications
const count = rxInt(5);
count.update(x => x + 1);
```

### 3. Batch Updates

```typescript
// ❌ Bad - Multiple updates
const user = rx({ name: '', age: 0 });
user.value = { ...user.value, name: 'John' };
user.value = { ...user.value, age: 25 };

// ✅ Good - Single update
const user = rx({ name: '', age: 0 });
user.value = { name: 'John', age: 25 };

// ✅ Better - Use update operator
const user = rx({ name: '', age: 0 });
user.update(u => ({ ...u, name: 'John', age: 25 }));
```

## 🔄 Related APIs

- **[Controller API](./controller.md)** - Controller class reference
- **[Subject API](./subject.md)** - Subject class reference
- **[React Hooks API](./react-hooks.md)** - React integration hooks
- **[Binding API](./binding.md)** - Dependency injection system

---

**🎉 You've mastered the Rx Variables API! Ready to explore other APIs?** 🚀 