# 🐛 Debugging Guide

Complete guide to troubleshoot and fix common Flox issues.

## 🔍 Common Issues

### 1. UI Not Updating

**Problem:** Changes to Rx variables don't trigger UI updates.

**Symptoms:**
- Button clicks don't update the display
- Form inputs don't reflect changes
- Computed values don't update

**Causes & Solutions:**

#### ❌ Wrong: Direct Access
```typescript
// Component
const count = controller.count.value; // Direct access
return <div>{count}</div>;
```

#### ✅ Correct: Use useRx Hook
```typescript
// Component
const [count] = useRx(controller.count); // Subscribe to changes
return <div>{count}</div>;
```

#### ❌ Wrong: Missing useController
```typescript
// Component
const controller = new CounterController(); // Not registered
const [count] = useRx(controller.count);
```

#### ✅ Correct: Register with useController
```typescript
// Component
const controller = useMemo(() => new CounterController(), []);
const counterController = useController(controller); // Register
const [count] = useRx(counterController.count);
```

### 2. Controller Not Initializing

**Problem:** Controller's `onInit()` method is not called.

**Symptoms:**
- `console.log('Controller initialized')` doesn't appear
- Subjects not created
- Initial data not loaded

**Causes & Solutions:**

#### ❌ Wrong: Controller Created Outside Component
```typescript
// Outside component - won't work
const controller = new CounterController();

function MyComponent() {
  const [count] = useRx(controller.count);
  return <div>{count}</div>;
}
```

#### ✅ Correct: Controller Created Inside Component
```typescript
function MyComponent() {
  const controller = useMemo(() => new CounterController(), []);
  const counterController = useController(controller);
  const [count] = useRx(counterController.count);
  return <div>{count}</div>;
}
```

#### ❌ Wrong: Multiple Controller Instances
```typescript
function MyComponent() {
  const controller = new CounterController(); // New instance every render
  const counterController = useController(controller);
  const [count] = useRx(counterController.count);
  return <div>{count}</div>;
}
```

#### ✅ Correct: Single Controller Instance
```typescript
function MyComponent() {
  const controller = useMemo(() => new CounterController(), []); // Single instance
  const counterController = useController(controller);
  const [count] = useRx(counterController.count);
  return <div>{count}</div>;
}
```

### 3. Memory Leaks

**Problem:** Controllers not properly disposed, causing memory leaks.

**Symptoms:**
- Event listeners still active after component unmount
- Rx variables not cleaned up
- Console warnings about memory

**Causes & Solutions:**

#### ❌ Wrong: No Cleanup
```typescript
export class MyController extends Controller {
  onInit() {
    window.addEventListener('resize', this.handleResize);
  }
  
  private handleResize = () => {
    // Handle resize
  };
}
```

#### ✅ Correct: Proper Cleanup
```typescript
export class MyController extends Controller {
  private listeners: (() => void)[] = [];
  
  onInit() {
    const handleResize = () => this.handleResize();
    window.addEventListener('resize', handleResize);
    this.listeners.push(() => window.removeEventListener('resize', handleResize));
  }
  
  onDispose() {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
  
  private handleResize = () => {
    // Handle resize
  };
}
```

### 4. Subject Not Found

**Problem:** Trying to access a subject that doesn't exist.

**Symptoms:**
- Error: "Subject not found"
- `undefined` values
- Runtime errors

**Causes & Solutions:**

#### ❌ Wrong: Subject Not Created
```typescript
export class MyController extends Controller {
  someMethod() {
    this.updateSubject('data', []); // Error: Subject not found
  }
}
```

#### ✅ Correct: Create Subject in onInit
```typescript
export class MyController extends Controller {
  onInit() {
    this.createSubject('data', []); // Create subject first
  }
  
  someMethod() {
    this.updateSubject('data', []); // Now it works
  }
}
```

#### ❌ Wrong: Wrong Subject Key
```typescript
export class MyController extends Controller {
  onInit() {
    this.createSubject('userData', null);
  }
  
  someMethod() {
    this.updateSubject('user', {}); // Wrong key
  }
}
```

#### ✅ Correct: Use Correct Key
```typescript
export class MyController extends Controller {
  onInit() {
    this.createSubject('userData', null);
  }
  
  someMethod() {
    this.updateSubject('userData', {}); // Correct key
  }
}
```

### 5. Rx Variable Not Reactive

**Problem:** Rx variables don't trigger updates when changed.

**Symptoms:**
- Direct value changes don't update UI
- Computed values don't recalculate
- Subscriptions don't fire

**Causes & Solutions:**

#### ❌ Wrong: Direct Property Assignment
```typescript
const user = rx({ name: 'John', age: 25 });
user.name = 'Jane'; // This doesn't trigger updates
```

#### ✅ Correct: Use .value Property
```typescript
const user = rx({ name: 'John', age: 25 });
user.value = { name: 'Jane', age: 25 }; // This triggers updates
```

#### ❌ Wrong: Mutating Object Properties
```typescript
const user = rx({ name: 'John', age: 25 });
user.value.name = 'Jane'; // Mutation doesn't trigger updates
```

#### ✅ Correct: Create New Object
```typescript
const user = rx({ name: 'John', age: 25 });
user.value = { ...user.value, name: 'Jane' }; // New object triggers updates
```

### 6. Binding Issues

**Problem:** Controllers not properly injected through bindings.

**Symptoms:**
- Controllers are undefined
- "Controller not found" errors
- Binding not initialized

**Causes & Solutions:**

#### ❌ Wrong: Binding Not Initialized
```typescript
function MyComponent() {
  const binding = new HomeBinding();
  const controller = binding.getControllerPublic('home'); // Undefined
  return <div>{controller?.name}</div>;
}
```

#### ✅ Correct: Initialize Binding
```typescript
function MyComponent() {
  const binding = useBinding('home', new HomeBinding());
  const controller = binding.getControllerPublic('home'); // Now works
  return <div>{controller?.name}</div>;
}
```

#### ❌ Wrong: Wrong Controller Key
```typescript
export class HomeBinding extends Binding {
  dependencies() {
    this.putController('user', new UserController());
  }
}

// In component
const controller = binding.getControllerPublic('home'); // Wrong key
```

#### ✅ Correct: Use Correct Key
```typescript
export class HomeBinding extends Binding {
  dependencies() {
    this.putController('user', new UserController());
  }
}

// In component
const controller = binding.getControllerPublic('user'); // Correct key
```

## 🔧 Debugging Tools

### 1. Console Logging

Add logging to track controller lifecycle:

```typescript
export class DebugController extends Controller {
  onInit() {
    console.log('🟢 Controller initialized:', this.constructor.name);
    console.log('📊 Subjects created:', this.subjects.size);
    
    this.createSubject('data', []);
    this.createSubject('loading', false);
    
    console.log('📊 Subjects after creation:', this.subjects.size);
  }
  
  onDispose() {
    console.log('🔴 Controller disposed:', this.constructor.name);
    console.log('📊 Final subjects count:', this.subjects.size);
  }
  
  someMethod() {
    console.log('🔧 Method called:', this.constructor.name);
    console.log('📊 Current subjects:', Array.from(this.subjects.keys()));
  }
}
```

### 2. Rx Variable Debugging

Add subscriptions to track Rx variable changes:

```typescript
export class DebugController extends Controller {
  onInit() {
    this.createSubject('count', 0);
    
    // Debug subscription
    const countSubject = this.getSubject('count');
    if (countSubject) {
      countSubject.subscribe((newValue) => {
        console.log('🔄 Count changed:', newValue);
        console.trace('Stack trace for count change');
      });
    }
  }
}
```

### 3. React DevTools

Use React DevTools to inspect component state:

```typescript
function MyComponent() {
  const controller = useMemo(() => new CounterController(), []);
  const counterController = useController(controller);
  const [count] = useRx(counterController.count);
  
  // Add debug info to React DevTools
  console.log('Component render:', { count, controller: counterController });
  
  return <div>{count}</div>;
}
```

### 4. Performance Monitoring

Monitor Rx variable performance:

```typescript
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
```

## 🛠️ Debugging Checklist

### Before Reporting an Issue

1. **Check Console Errors**
   - Look for JavaScript errors
   - Check for React warnings
   - Verify TypeScript compilation

2. **Verify Controller Lifecycle**
   - `onInit()` is called
   - `onDispose()` is called
   - Subjects are created

3. **Check Rx Variable Usage**
   - Using `useRx` hook
   - Using `.value` property
   - Not mutating objects directly

4. **Verify React Integration**
   - `useController` is called
   - `useMemo` for controller creation
   - Component re-renders properly

5. **Check Binding Setup**
   - Binding is initialized
   - Correct controller keys
   - Dependencies are set up

### Debugging Steps

1. **Add Console Logs**
   ```typescript
   console.log('🔍 Debug point 1:', { controller, subjects: controller.subjects.size });
   ```

2. **Check Rx Variable State**
   ```typescript
   console.log('🔍 Rx variable state:', { 
     value: rx.value, 
     observerCount: rx.observerCount,
     isDisposed: rx.isDisposed 
   });
   ```

3. **Verify React Hooks**
   ```typescript
   console.log('🔍 React hooks:', { 
     controller: !!controller, 
     rxValue: !!rxValue,
     componentRendered: true 
   });
   ```

4. **Test Minimal Example**
   ```typescript
   // Create minimal test case
   const testController = new TestController();
   const testRx = rxInt(0);
   console.log('🔍 Test:', { controller: testController, rx: testRx });
   ```

## 🆘 Getting Help

### When Creating an Issue

Include this information:

```markdown
## Environment
- Flox version: `npm list flox-react`
- React version: `npm list react`
- Node.js version: `node --version`
- Browser: Chrome/Firefox/Safari version

## Error Details
- Error message: (full error from console)
- Steps to reproduce: (detailed steps)
- Expected behavior: (what should happen)
- Actual behavior: (what actually happens)

## Code Example
```typescript
// Minimal reproduction code
import { Controller, useController, useRx, rxInt } from 'flox-react';

export class TestController extends Controller {
  count = rxInt(0);
  
  increment() {
    this.count.value++;
  }
}

function TestComponent() {
  const controller = useMemo(() => new TestController(), []);
  const testController = useController(controller);
  const [count] = useRx(testController.count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => testController.increment()}>Increment</button>
    </div>
  );
}
```

## Console Output
```
// Paste console output here
```

## Additional Context
- What were you trying to accomplish?
- What other libraries are you using?
- Any recent changes that might have caused this?
```

### Common Debugging Commands

```bash
# Check Flox version
npm list flox-react

# Check React version
npm list react

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npx eslint src/

# Run tests
npm test

# Build project
npm run build
```

## 🔄 Performance Debugging

### 1. Monitor Re-renders

```typescript
function MyComponent() {
  console.log('🔄 Component rendered:', Date.now());
  
  const controller = useMemo(() => new CounterController(), []);
  const counterController = useController(controller);
  const [count] = useRx(counterController.count);
  
  return <div>{count}</div>;
}
```

### 2. Check Rx Variable Performance

```typescript
export class PerformanceController extends Controller {
  expensiveData = rx<ExpensiveData[]>([]);
  
  onInit() {
    // Monitor expensive computations
    const expensiveComputed = this.expensiveData.map(data => {
      console.log('🔄 Expensive computation running');
      return data.filter(item => complexFilter(item));
    });
  }
}
```

### 3. Memory Usage

```typescript
export class MemoryController extends Controller {
  onInit() {
    console.log('🧠 Memory usage:', performance.memory?.usedJSHeapSize);
  }
  
  onDispose() {
    console.log('🧠 Memory after dispose:', performance.memory?.usedJSHeapSize);
  }
}
```

## 🔄 Next Steps

If you're still having issues:

1. **Check the [Installation Guide](../getting-started/installation.md)** for setup issues
2. **Review [Common Problems](#-common-issues)** for solutions
3. **Search [GitHub Issues](https://github.com/KreasiMaju/flox-react/issues)** for similar problems
4. **Ask in [GitHub Discussions](https://github.com/KreasiMaju/flox-react/discussions)**
5. **Create a new issue** with detailed information

---

**🎉 You're now equipped to debug Flox issues! Need more help?** 🚀 