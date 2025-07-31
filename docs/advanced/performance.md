# ⚡ Performance Guide

Optimize your Flox applications for better performance.

## 🎯 Performance Principles

### 1. Minimize Re-renders
- Use `useRx` instead of direct access
- Avoid unnecessary Rx variable updates
- Batch multiple updates together

### 2. Optimize Computed Values
- Cache expensive computations
- Use `where` for filtering
- Break down complex computations

### 3. Manage Memory
- Clean up subscriptions in `onDispose`
- Dispose Rx variables when done
- Avoid memory leaks

## 🔄 Rx Variable Optimization

### ✅ Good Performance Patterns

```typescript
// ✅ Good - Cache expensive computations
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
  
  get expensiveProducts() {
    return this.products.where(products => 
      products.filter(product => product.price > 100)
    );
  }
}

// ✅ Good - Batch updates
export class CartController extends Controller {
  items = rx<CartItem[]>([]);
  
  addMultipleItems(newItems: CartItem[]) {
    // Single update instead of multiple
    this.items.value = [...this.items.value, ...newItems];
  }
  
  updateItemQuantity(itemId: string, quantity: number) {
    // Single update
    this.items.update(items => 
      items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
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
        .reduce((sum, item) => sum + item.value, 0)
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

// ❌ Bad - Unnecessary Rx variables
export class UserController extends Controller {
  user = rx<User | null>(null);
  userName = rxString(''); // Redundant - can be computed
  
  setUser(user: User) {
    this.user.value = user;
    this.userName.value = user.name; // Unnecessary
  }
}
```

## 🎣 React Component Optimization

### ✅ Good Component Patterns

```typescript
// ✅ Good - Memoize controller creation
export const UserProfile: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const userController = useController(controller);
  
  const [user] = useRx(userController.user);
  const [loading] = useRx(userController.loading);
  
  return (
    <div>
      {loading ? <div>Loading...</div> : <div>{user?.name}</div>}
    </div>
  );
};

// ✅ Good - Use React.memo for expensive components
export const ProductList = React.memo<{ products: Product[] }>(({ products }) => {
  return (
    <div>
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
});

// ✅ Good - Separate expensive computations
export const ExpensiveComponent: React.FC = () => {
  const controller = useMemo(() => new DataController(), []);
  const dataController = useController(controller);
  
  const [rawData] = useRx(dataController.data);
  
  // Memoize expensive computation
  const processedData = useMemo(() => {
    return rawData.map(item => complexTransform(item));
  }, [rawData]);
  
  return <div>{/* Render processed data */}</div>;
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

// ❌ Bad - Unnecessary re-renders
export const ProductList: React.FC = () => {
  const controller = useMemo(() => new ProductController(), []);
  const productController = useController(controller);
  
  const [products] = useRx(productController.products);
  const [filteredProducts] = useRx(productController.filteredProducts);
  
  // This component re-renders when products change, even if filteredProducts don't
  return (
    <div>
      {filteredProducts.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## 🧹 Memory Management

### ✅ Good Memory Patterns

```typescript
// ✅ Good - Proper cleanup
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

// ✅ Good - Dispose Rx variables
export class DisposableController extends Controller {
  private rxVariables: Rx<any>[] = [];
  
  onInit() {
    const tempData = rx<Data[]>([]);
    this.rxVariables.push(tempData);
  }
  
  onDispose() {
    this.rxVariables.forEach(rx => rx.dispose());
    this.rxVariables = [];
  }
}
```

### ❌ Avoid These Patterns

```typescript
// ❌ Bad - No cleanup
export class LeakyController extends Controller {
  onInit() {
    window.addEventListener('resize', this.handleResize);
    setInterval(() => this.updateData(), 5000);
  }
  
  private handleResize = () => {
    // Handle resize
  };
}

// ❌ Bad - Rx variables not disposed
export class LeakyController extends Controller {
  onInit() {
    const tempData = rx<Data[]>([]);
    // tempData is never disposed
  }
}
```

## 📊 Performance Monitoring

### ✅ Good Monitoring Patterns

```typescript
// ✅ Good - Monitor re-renders
export const MonitoredComponent: React.FC = () => {
  console.log('🔄 Component rendered:', Date.now());
  
  const controller = useMemo(() => new DataController(), []);
  const dataController = useController(controller);
  
  const [data] = useRx(dataController.data);
  
  return <div>{/* Render data */}</div>;
};

// ✅ Good - Monitor Rx variable performance
export class PerformanceController extends Controller {
  onInit() {
    this.createSubject('data', []);
    
    const dataSubject = this.getSubject('data');
    if (dataSubject) {
      console.log('📊 Initial observer count:', dataSubject.observerCount);
      
      dataSubject.subscribe(() => {
        console.log('📊 Current observer count:', dataSubject.observerCount);
      });
    }
  }
}

// ✅ Good - Monitor memory usage
export class MemoryController extends Controller {
  onInit() {
    console.log('🧠 Memory usage:', performance.memory?.usedJSHeapSize);
  }
  
  onDispose() {
    console.log('🧠 Memory after dispose:', performance.memory?.usedJSHeapSize);
  }
}
```

## 🔧 Performance Tools

### 1. React DevTools Profiler
```typescript
// Use React DevTools Profiler to identify slow components
import { Profiler } from 'react';

export const ProfiledComponent: React.FC = () => {
  const onRender = (id: string, phase: string, actualDuration: number) => {
    console.log(`Component ${id} took ${actualDuration}ms to render`);
  };
  
  return (
    <Profiler id="UserProfile" onRender={onRender}>
      <UserProfile />
    </Profiler>
  );
};
```

### 2. Performance API
```typescript
// Measure specific operations
export class PerformanceController extends Controller {
  async expensiveOperation() {
    const start = performance.now();
    
    // Expensive operation
    await this.processData();
    
    const end = performance.now();
    console.log(`Operation took ${end - start}ms`);
  }
}
```

### 3. Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer dist/stats.json

# Check for unused dependencies
npx depcheck
```

## 🎯 Performance Checklist

### Before Optimization
- [ ] Identify performance bottlenecks
- [ ] Measure current performance
- [ ] Set performance goals
- [ ] Choose optimization strategy

### During Optimization
- [ ] Optimize Rx variable usage
- [ ] Minimize component re-renders
- [ ] Implement proper cleanup
- [ ] Cache expensive computations
- [ ] Batch updates where possible

### After Optimization
- [ ] Measure performance improvements
- [ ] Test on different devices
- [ ] Monitor memory usage
- [ ] Document optimizations

## 🔄 Common Performance Issues

### 1. Too Many Re-renders
```typescript
// ❌ Problem - Component re-renders too often
const [data] = useRx(controller.data);
const [filteredData] = useRx(controller.filteredData);
const [sortedData] = useRx(controller.sortedData);

// ✅ Solution - Combine into single computed value
const [processedData] = useRx(controller.processedData);
```

### 2. Memory Leaks
```typescript
// ❌ Problem - Event listeners not cleaned up
onInit() {
  window.addEventListener('resize', this.handleResize);
}

// ✅ Solution - Clean up in onDispose
onInit() {
  const handleResize = () => this.handleResize();
  window.addEventListener('resize', handleResize);
  this.listeners.push(() => window.removeEventListener('resize', handleResize));
}

onDispose() {
  this.listeners.forEach(cleanup => cleanup());
}
```

### 3. Expensive Computations
```typescript
// ❌ Problem - Expensive computation on every access
get expensiveValue() {
  return this.data.map(items => 
    items.filter(item => complexFilter(item))
      .map(item => complexTransform(item))
      .reduce((sum, item) => sum + item.value, 0)
  );
}

// ✅ Solution - Cache expensive computations
get expensiveValue() {
  return this.filteredData.map(items => 
    items.map(item => complexTransform(item))
      .reduce((sum, item) => sum + item.value, 0)
  );
}

get filteredData() {
  return this.data.where(items => 
    items.filter(item => complexFilter(item))
  );
}
```

## 🔄 Next Steps

1. **[Best Practices](./best-practices.md)** - Follow Flox conventions
2. **[Debugging Guide](./debugging.md)** - Troubleshoot performance issues
3. **[Monitoring Guide](./monitoring.md)** - Monitor performance in real-time
4. **[Optimization Guide](./optimization.md)** - Memory leak prevention and performance optimization
5. **[Testing Framework](../testing/README.md)** - Test performance and memory usage
6. **[Examples](../examples/advanced-examples.md)** - See optimization patterns
7. **[API Reference](../api/controller.md)** - Master the APIs

---

**🎉 Your Flox app is now optimized for performance!** 🚀 