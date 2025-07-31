# ⚡ Flox State Management Optimization

Panduan lengkap untuk mengoptimasi state management Flox dan mencegah memory leaks.

## 🎯 Overview

Flox sudah dioptimasi untuk performa tinggi, tetapi ada beberapa praktik yang dapat membantu Anda mendapatkan performa terbaik dan mencegah memory leaks.

## 🔧 Optimasi Core

### 1. **Memory Leak Prevention**

#### ✅ Good - Proper Cleanup
```typescript
export class OptimizedController extends Controller {
  private listeners: (() => void)[] = [];
  private intervals: number[] = [];
  private subscriptions: (() => void)[] = [];
  
  onInit() {
    // Event listeners dengan cleanup
    const handleResize = () => this.handleWindowResize();
    window.addEventListener('resize', handleResize);
    this.listeners.push(() => window.removeEventListener('resize', handleResize));
    
    // Intervals dengan cleanup
    const interval = setInterval(() => this.updateData(), 5000);
    this.intervals.push(interval);
    
    // Subscriptions dengan cleanup
    const subscription = this.data.subscribe(value => {
      console.log('Data changed:', value);
    });
    this.subscriptions.push(subscription);
  }
  
  onDispose() {
    // Cleanup semua resources
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
    
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    this.subscriptions.forEach(subscription => subscription());
    this.subscriptions = [];
  }
}
```

#### ❌ Bad - No Cleanup
```typescript
export class LeakyController extends Controller {
  onInit() {
    // ❌ Memory leak - tidak ada cleanup
    window.addEventListener('resize', this.handleResize);
    setInterval(() => this.updateData(), 5000);
  }
}
```

### 2. **Rx Variable Optimization**

#### ✅ Good - Efficient Rx Usage
```typescript
export class OptimizedController extends Controller {
  // ✅ Specific factory functions
  count = rxInt(0);
  name = rxString('');
  active = rxBool(false);
  
  // ✅ Computed values untuk derived state
  get totalPrice() {
    return this.items.map(items => 
      items.reduce((sum, item) => sum + item.price, 0)
    );
  }
  
  // ✅ Batch updates
  addMultipleItems(newItems: Item[]) {
    this.items.value = [...this.items.value, ...newItems];
  }
  
  // ✅ Use update untuk complex changes
  updateItemQuantity(itemId: string, quantity: number) {
    this.items.update(items => 
      items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }
}
```

#### ❌ Bad - Inefficient Rx Usage
```typescript
export class InefficientController extends Controller {
  // ❌ Generic untuk simple types
  count = rx<number>(0);
  name = rx<string>('');
  
  // ❌ Multiple updates
  addMultipleItems(newItems: Item[]) {
    newItems.forEach(item => {
      this.items.value = [...this.items.value, item]; // Multiple re-renders
    });
  }
  
  // ❌ Expensive computations
  get expensiveValue() {
    return this.data.map(items => 
      items.filter(item => complexFilter(item))
        .map(item => complexTransform(item))
        .reduce((sum, item) => sum + item.value, 0)
    );
  }
}
```

## 🎣 React Component Optimization

### 1. **Controller Creation**

#### ✅ Good - Memoized Controller
```typescript
export const OptimizedComponent: React.FC = () => {
  // ✅ Memoize controller creation
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
```

#### ❌ Bad - Controller Created Every Render
```typescript
export const BadComponent: React.FC = () => {
  // ❌ New controller every render
  const controller = new UserController();
  const userController = useController(controller);
  // ...
};
```

### 2. **Component Memoization**

#### ✅ Good - React.memo
```typescript
export const ExpensiveComponent = React.memo<{ data: Data[] }>(({ data }) => {
  const controller = useMemo(() => new DataController(), []);
  const dataController = useController(controller);
  
  const [processedData] = useRx(dataController.processedData);
  
  return (
    <div>
      {processedData.map(item => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  );
});
```

### 3. **Expensive Computations**

#### ✅ Good - useMemo for Expensive Operations
```typescript
export const OptimizedComponent: React.FC = () => {
  const controller = useMemo(() => new DataController(), []);
  const dataController = useController(controller);
  
  const [rawData] = useRx(dataController.data);
  
  // ✅ Memoize expensive computation
  const processedData = useMemo(() => {
    return rawData.map(item => complexTransform(item));
  }, [rawData]);
  
  return <div>{/* Render processed data */}</div>;
};
```

## 🔍 Monitoring Optimization

### 1. **Optimized Monitoring Hook**

```typescript
import { 
  useFloxMonitorOptimized,
  useFloxPerformanceMonitorOptimized,
  useFloxMemoryMonitorOptimized
} from 'flox';

export const OptimizedComponent: React.FC = () => {
  // ✅ Optimized monitoring dengan rate limiting dan auto cleanup
  const { reportError, reportWarning } = useFloxMonitorOptimized({
    componentName: 'OptimizedComponent',
    maxErrors: 50, // Limit jumlah error
    maxWarnings: 50, // Limit jumlah warning
    autoCleanup: true, // Auto cleanup
    cleanupInterval: 300000 // 5 menit
  });
  
  // ✅ Optimized performance monitoring
  useFloxPerformanceMonitorOptimized('OptimizedComponent');
  
  // ✅ Optimized memory monitoring
  useFloxMemoryMonitorOptimized('OptimizedComponent');
  
  // Component logic...
};
```

### 2. **Rate Limiting**

```typescript
// ✅ Rate limiting untuk mencegah spam
const reportError = useCallback((error: FloxError) => {
  const now = Date.now();
  const lastErrorTime = lastErrorTimeRef.current;
  
  if (now - lastErrorTime < 1000) return; // Max 1 error per second
  
  lastErrorTimeRef.current = now;
  floxMonitor.reportError(error);
}, []);
```

## 🧹 Memory Management Best Practices

### 1. **Dispose Pattern**

```typescript
export class DisposableController extends Controller {
  private disposables: (() => void)[] = [];
  
  onInit() {
    // Add disposables
    this.addDisposable(this.setupEventListeners());
    this.addDisposable(this.setupIntervals());
    this.addDisposable(this.setupSubscriptions());
  }
  
  onDispose() {
    // Cleanup semua disposables
    this.disposables.forEach(dispose => dispose());
    this.disposables = [];
  }
  
  private addDisposable(dispose: () => void) {
    this.disposables.push(dispose);
  }
  
  private setupEventListeners() {
    const handleResize = () => this.handleWindowResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }
}
```

### 2. **Weak References**

```typescript
export class WeakReferenceController extends Controller {
  private weakMap = new WeakMap<object, any>();
  
  onInit() {
    const element = document.getElementById('my-element');
    if (element) {
      // WeakMap tidak akan mencegah garbage collection
      this.weakMap.set(element, { data: 'some data' });
    }
  }
}
```

### 3. **AbortController**

```typescript
export class AbortControllerExample extends Controller {
  private abortController: AbortController | null = null;
  
  onInit() {
    this.abortController = new AbortController();
    
    // Event listeners dengan AbortController
    window.addEventListener('resize', this.handleResize, {
      signal: this.abortController.signal
    });
  }
  
  onDispose() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
```

## 📊 Performance Monitoring

### 1. **Render Performance**

```typescript
export const PerformanceComponent: React.FC = () => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow render: ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });
  
  // Component logic...
};
```

### 2. **Memory Usage Monitoring**

```typescript
export const MemoryComponent: React.FC = () => {
  useEffect(() => {
    if (typeof performance === 'undefined' || !(performance as any).memory) return;
    
    const interval = setInterval(() => {
      const usedMemory = (performance as any).memory.usedJSHeapSize;
      const maxMemory = (performance as any).memory.jsHeapSizeLimit;
      const memoryUsage = (usedMemory / maxMemory) * 100;
      
      if (memoryUsage > 80) {
        console.warn(`High memory usage: ${Math.round(memoryUsage)}%`);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Component logic...
};
```

## 🔄 Binding Optimization

### 1. **Lazy Loading**

```typescript
export class OptimizedBinding extends Binding {
  dependencies() {
    // ✅ Lazy controllers - hanya dibuat saat dibutuhkan
    this.lazyPut('analytics', () => new AnalyticsController());
    this.lazyPut('logging', () => new LoggingController());
    
    // ✅ Normal controllers
    this.putController('user', new UserController());
    this.putController('settings', new SettingsController());
  }
}
```

### 2. **Fenix Controllers**

```typescript
export class OptimizedBinding extends Binding {
  dependencies() {
    // ✅ Fenix controllers - recreated setiap access
    this.putFenix('temp', () => new TempController());
    this.putFenix('cache', () => new CacheController());
  }
}
```

## 🎯 Optimization Checklist

### Before Optimization
- [ ] Identify performance bottlenecks
- [ ] Measure current memory usage
- [ ] Check for memory leaks
- [ ] Analyze render performance

### During Optimization
- [ ] Use memoized controllers
- [ ] Implement proper cleanup
- [ ] Optimize Rx variable usage
- [ ] Add React.memo where needed
- [ ] Use useMemo for expensive computations
- [ ] Implement rate limiting

### After Optimization
- [ ] Measure performance improvements
- [ ] Test memory usage
- [ ] Monitor for memory leaks
- [ ] Document optimizations

## 🔧 Tools for Optimization

### 1. **React DevTools Profiler**
```typescript
import { Profiler } from 'react';

export const ProfiledComponent: React.FC = () => {
  const onRender = (id: string, phase: string, actualDuration: number) => {
    console.log(`Component ${id} took ${actualDuration}ms to render`);
  };
  
  return (
    <Profiler id="MyComponent" onRender={onRender}>
      <MyComponent />
    </Profiler>
  );
};
```

### 2. **Performance API**
```typescript
export class PerformanceController extends Controller {
  async measureOperation(operation: () => Promise<void>) {
    const start = performance.now();
    await operation();
    const end = performance.now();
    
    console.log(`Operation took ${end - start}ms`);
  }
}
```

### 3. **Memory Leak Detection**
```typescript
export class MemoryLeakDetector {
  private static instances = new Set();
  
  constructor() {
    MemoryLeakDetector.instances.add(this);
  }
  
  dispose() {
    MemoryLeakDetector.instances.delete(this);
  }
  
  static getInstanceCount() {
    return MemoryLeakDetector.instances.size;
  }
}
```

## 🔄 Next Steps

1. **[Performance Guide](./performance.md)** - Optimize your app performance
2. **[Monitoring Guide](./monitoring.md)** - Monitor your app in real-time
3. **[Testing Framework](../testing/README.md)** - Test performance and memory leaks
4. **[Best Practices](./best-practices.md)** - Follow Flox conventions
5. **[Examples](../examples/advanced-examples.md)** - See optimization patterns

---

**🎉 Your Flox app is now optimized for maximum performance!** 🚀 