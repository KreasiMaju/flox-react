# 🔄 Rx Variables

Rx Variables are the core of Flox's reactive state management - they automatically update the UI when their values change.

## 🎯 What are Rx Variables?

**Rx Variables** are reactive state containers that:
- **Hold values** - Store any type of data (string, number, boolean, object, array)
- **Notify changes** - Automatically trigger UI updates when values change
- **Provide operators** - Transform and filter values with built-in methods
- **Manage subscriptions** - Handle React component subscriptions automatically

Think of Rx Variables as "smart" variables that know when they change and tell React to re-render.

## 🏗️ Creating Rx Variables

### Basic Creation

```typescript
import { rx, rxInt, rxString, rxBool } from 'flox-react';

// Specific types
const count = rxInt(0);        // number
const name = rxString('');     // string
const active = rxBool(false);  // boolean

// Generic type
const user = rx({ name: '', age: 0 });  // object
const items = rx<string[]>([]);         // array
const data = rx<any>(null);             // any type
```

### Factory Functions

```typescript
// rx() - Generic Rx variable
const generic = rx('initial value');

// rxInt() - Integer Rx variable
const number = rxInt(42);

// rxString() - String Rx variable
const text = rxString('Hello World');

// rxBool() - Boolean Rx variable
const flag = rxBool(true);
```

## 🔍 Rx Variable Properties

### Value Access

```typescript
const count = rxInt(5);

// Get current value
console.log(count.value); // 5

// Set new value
count.value = 10;
console.log(count.value); // 10
```

### Subscription Management

```typescript
const name = rxString('John');

// Subscribe to changes
const unsubscribe = name.subscribe((newValue) => {
  console.log('Name changed to:', newValue);
});

// Change value (triggers subscription)
name.value = 'Jane'; // Logs: "Name changed to: Jane"

// Unsubscribe when done
unsubscribe();
```

## 🛠️ Rx Operators

Rx Variables come with powerful operators for transforming and filtering values.

### Map Operator

Transform values without changing the original:

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

### Where Operator

Filter values based on conditions:

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

### Update Operator

Modify values using a function:

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

## 🎯 Advanced Rx Patterns

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

## 🔗 Using Rx Variables in Controllers

### Basic Controller with Rx

```typescript
import { Controller } from 'flox-react';
import { rxInt, rxString, rxBool } from 'flox-react';

export class UserController extends Controller {
  // Rx variables for state
  name = rxString('');
  age = rxInt(0);
  isLoggedIn = rxBool(false);
  
  // Computed Rx variables
  get displayName() {
    return this.name.map(n => n || 'Guest');
  }
  
  get isAdult() {
    return this.age.map(a => a >= 18);
  }
  
  get userInfo() {
    return this.name.map(n => ({
      name: n,
      age: this.age.value,
      isLoggedIn: this.isLoggedIn.value,
      isAdult: this.age.value >= 18
    }));
  }
  
  // Methods to update state
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
  
  updateAge(newAge: number) {
    this.age.value = newAge;
  }
}
```

### Complex Controller with Rx Operators

```typescript
export class ProductController extends Controller {
  products = rx<Product[]>([]);
  searchTerm = rxString('');
  category = rxString('all');
  priceRange = rx({ min: 0, max: 1000 });
  
  // Computed filtered products
  get filteredProducts() {
    return this.products.where(products => 
      products.filter(product => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(this.searchTerm.value.toLowerCase());
        
        const matchesCategory = this.category.value === 'all' || 
          product.category === this.category.value;
        
        const matchesPrice = product.price >= this.priceRange.value.min && 
          product.price <= this.priceRange.value.max;
        
        return matchesSearch && matchesCategory && matchesPrice;
      })
    );
  }
  
  // Computed statistics
  get totalProducts() {
    return this.products.map(products => products.length);
  }
  
  get averagePrice() {
    return this.products.map(products => {
      if (products.length === 0) return 0;
      const total = products.reduce((sum, p) => sum + p.price, 0);
      return total / products.length;
    });
  }
  
  get expensiveProducts() {
    return this.products.where(products => 
      products.filter(p => p.price > 100)
    );
  }
  
  // Methods
  async loadProducts() {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      this.products.value = data;
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }
  
  setSearchTerm(term: string) {
    this.searchTerm.value = term;
  }
  
  setCategory(category: string) {
    this.category.value = category;
  }
  
  setPriceRange(min: number, max: number) {
    this.priceRange.value = { min, max };
  }
}
```

## 🎣 Using Rx Variables in React

### Basic Usage with useRx

```typescript
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { UserController } from '../controllers/UserController';

export const UserProfile: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const userController = useController(controller);
  
  // Subscribe to Rx variables
  const [name] = useRx(userController.name);
  const [age] = useRx(userController.age);
  const [isLoggedIn] = useRx(userController.isLoggedIn);
  const [displayName] = useRx(userController.displayName);
  const [isAdult] = useRx(userController.isAdult);
  
  return (
    <div>
      <h1>Welcome, {displayName}!</h1>
      
      {isLoggedIn ? (
        <div>
          <p>Name: {name}</p>
          <p>Age: {age}</p>
          <p>Status: {isAdult ? 'Adult' : 'Minor'}</p>
          <button onClick={() => userController.logout()}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <button onClick={() => userController.login('John', 25)}>
            Login
          </button>
        </div>
      )}
    </div>
  );
};
```

### Advanced Usage with Computed Values

```typescript
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { ProductController } from '../controllers/ProductController';

export const ProductList: React.FC = () => {
  const controller = useMemo(() => new ProductController(), []);
  const productController = useController(controller);
  
  // Subscribe to computed Rx variables
  const [filteredProducts] = useRx(productController.filteredProducts);
  const [totalProducts] = useRx(productController.totalProducts);
  const [averagePrice] = useRx(productController.averagePrice);
  const [expensiveProducts] = useRx(productController.expensiveProducts);
  
  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => productController.setSearchTerm(e.target.value)}
        />
        
        <select onChange={(e) => productController.setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>
      
      <div className="stats">
        <p>Total Products: {totalProducts}</p>
        <p>Average Price: ${averagePrice.toFixed(2)}</p>
        <p>Expensive Products: {expensiveProducts.length}</p>
      </div>
      
      <div className="products">
        {filteredProducts.map(product => (
          <div key={product.id} className="product">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>Category: {product.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 Best Practices

### 1. Use Appropriate Factory Functions

```typescript
// ✅ Good - Use specific factory functions
const count = rxInt(0);
const name = rxString('');
const active = rxBool(false);

// ✅ Good - Use generic for complex types
const user = rx<User>({ name: '', age: 0 });
const products = rx<Product[]>([]);

// ❌ Avoid - Don't use generic for simple types
const count = rx<number>(0);
const name = rx<string>('');
```

### 2. Keep Rx Variables Simple

```typescript
// ✅ Good - Simple, focused Rx variables
const name = rxString('');
const age = rxInt(0);
const isLoggedIn = rxBool(false);

// ❌ Avoid - Complex Rx variables
const userState = rx({
  name: '',
  age: 0,
  isLoggedIn: false,
  preferences: {},
  history: []
});
```

### 3. Use Computed Values for Derived State

```typescript
export class CartController extends Controller {
  items = rx<CartItem[]>([]);
  
  // ✅ Good - Computed values
  get totalItems() {
    return this.items.map(items => 
      items.reduce((sum, item) => sum + item.quantity, 0)
    );
  }
  
  get totalPrice() {
    return this.items.map(items => 
      items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    );
  }
  
  get isEmpty() {
    return this.items.map(items => items.length === 0);
  }
}
```

### 4. Handle Cleanup Properly

```typescript
export class CleanupController extends Controller {
  data = rx<any[]>([]);
  subscriptions: (() => void)[] = [];
  
  onInit() {
    // Store subscriptions for cleanup
    const unsubscribe = this.data.subscribe(value => {
      console.log('Data changed:', value);
    });
    this.subscriptions.push(unsubscribe);
  }
  
  onDispose() {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
}
```

## 🆘 Common Issues

### Rx Variable Not Updating UI

```typescript
// ❌ Wrong - Direct access
const count = controller.count.value;

// ✅ Correct - Use useRx hook
const [count] = useRx(controller.count);
```

### Forgetting to Subscribe

```typescript
// ❌ Wrong - No subscription
const name = controller.name.value;

// ✅ Correct - Subscribe with useRx
const [name] = useRx(controller.name);
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

## 🔄 Next Steps

Now that you understand Rx Variables, explore:

1. **[Bindings](./bindings.md)** - Learn dependency injection
2. **[Subjects](./subjects.md)** - Advanced state management
3. **[Advanced Examples](../examples/advanced-examples.md)** - Complex Rx patterns
4. **[Performance Optimization](../advanced/performance.md)** - Optimize your Rx usage

---

**🎉 You've mastered Rx Variables! Ready to explore Bindings?** 🚀 