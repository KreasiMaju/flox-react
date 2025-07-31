# 🚀 Quick Start Guide

Get Flox running in your React project in just 5 minutes!

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** (version 16 or higher)
- **React** (version 16.8 or higher for hooks support)
- **TypeScript** (optional but recommended)

## ⚡ Installation

### Step 1: Install Flox

Choose your package manager:

```bash
# Using npm
npm install flox-react

# Using yarn
yarn add flox-react

# Using bun (recommended)
bun add flox-react

# Using pnpm
pnpm add flox-react
```

### Step 2: Verify Installation

Check if Flox is installed correctly:

```bash
# Check package.json
cat package.json | grep flox-react

# Should show something like:
# "flox-react": "^1.0.0"
```

## 🎯 Your First Flox App

Let's create a simple counter app to understand Flox basics.

### Step 1: Create a Controller

Create a file `src/controllers/CounterController.ts`:

```typescript
import { Controller } from 'flox-react';
import { rxInt, rxString } from 'flox-react';

export class CounterController extends Controller {
  // Rx variables - reactive state that automatically updates UI
  count = rxInt(0);
  name = rxString('User');

  // Methods to update state
  increment() {
    this.count.value++; // UI automatically updates!
  }

  decrement() {
    this.count.value--;
  }

  reset() {
    this.count.value = 0;
  }

  updateName(newName: string) {
    this.name.value = newName;
  }

  // Lifecycle methods
  onInit() {
    console.log('CounterController initialized!');
  }

  onDispose() {
    console.log('CounterController disposed!');
  }
}
```

**🔍 What's happening here?**

- **`Controller`** - Base class that provides state management capabilities
- **`rxInt(0)`** - Creates a reactive integer variable starting at 0
- **`rxString('User')`** - Creates a reactive string variable
- **`this.count.value++`** - Updates the reactive variable, UI automatically re-renders
- **`onInit()`** - Called when controller is first used
- **`onDispose()`** - Called when controller is no longer needed

### Step 2: Create a React Component

Create a file `src/components/Counter.tsx`:

```typescript
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { CounterController } from '../controllers/CounterController';

export const Counter: React.FC = () => {
  // Create controller instance (only once per component)
  const controller = useMemo(() => new CounterController(), []);
  
  // Register controller with React lifecycle
  const counterController = useController(controller);
  
  // Subscribe to reactive variables
  const [count, setCount] = useRx(counterController.count);
  const [name, setName] = useRx(counterController.name);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello {name}!</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Counter: {count}</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => counterController.increment()}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            ➕ Increment
          </button>
          
          <button 
            onClick={() => counterController.decrement()}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            ➖ Decrement
          </button>
          
          <button 
            onClick={() => counterController.reset()}
            style={{ padding: '8px 16px' }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="name">Your Name: </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => counterController.updateName(e.target.value)}
          style={{ padding: '8px', marginLeft: '10px' }}
          placeholder="Enter your name"
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>💡 Try changing the name or clicking the buttons!</p>
        <p>🔄 Notice how the UI updates automatically!</p>
      </div>
    </div>
  );
};
```

**🔍 What's happening here?**

- **`useMemo(() => new CounterController(), [])`** - Creates controller instance only once
- **`useController(controller)`** - Registers controller with React lifecycle
- **`useRx(counterController.count)`** - Subscribes to reactive variable, returns `[value, setter]`
- **`counterController.increment()`** - Calls controller method to update state
- **UI automatically updates** when reactive variables change

### Step 3: Use in Your App

Update your `src/App.tsx`:

```typescript
import React from 'react';
import { Counter } from './components/Counter';

function App() {
  return (
    <div className="App">
      <Counter />
    </div>
  );
}

export default App;
```

### Step 4: Run Your App

```bash
# Start development server
npm start
# or
yarn start
# or
bun dev
```

Visit `http://localhost:3000` and you should see your counter app!

## 🎉 What You've Learned

### ✅ Core Concepts Covered

1. **Controller Pattern** - Business logic and state in one place
2. **Rx Variables** - Reactive state that updates UI automatically
3. **React Integration** - Hooks to connect Flox with React
4. **Lifecycle Management** - Automatic cleanup and initialization

### ✅ Key Benefits Experienced

- **🚀 Automatic UI Updates** - No manual re-rendering needed
- **🎯 Clean Code** - Business logic separated from UI
- **⚡ Performance** - Only components that use changed state re-render
- **🛡️ Type Safety** - Full TypeScript support

## 🔄 Next Steps

Now that you have a basic understanding, explore:

1. **[Controllers Deep Dive](../core-concepts/controllers.md)** - Learn more about controllers
2. **[Rx Variables](../core-concepts/rx-variables.md)** - Master reactive programming
3. **[Bindings](../core-concepts/bindings.md)** - Learn dependency injection
4. **[Basic Examples](../examples/basic-examples.md)** - More practical examples

## 🆘 Troubleshooting

### Common Issues

**❌ Error: "Cannot find module 'flox-react'"**
```bash
# Solution: Reinstall the package
npm install flox-react
# or
yarn add flox-react
```

**❌ Error: "useController is not a function"**
```typescript
// Make sure you're importing correctly
import { useController, useRx } from 'flox-react';
```

**❌ UI not updating when state changes**
```typescript
// Make sure you're using useRx hook
const [count] = useRx(controller.count);
// NOT: const count = controller.count.value;
```

**❌ Controller methods not working**
```typescript
// Make sure you're calling methods on the controller instance
const controller = useController(new CounterController());
controller.increment(); // ✅ Correct
// NOT: CounterController.increment(); // ❌ Wrong
```

### Still Having Issues?

- Check the **[Installation Guide](./installation.md)** for detailed setup
- Review **[Common Problems](./../advanced/debugging.md)** for solutions
- Ask for help in **[GitHub Discussions](https://github.com/KreasiMaju/flox-react/discussions)**

---

**🎉 Congratulations! You've successfully created your first Flox app!**

Ready to build something amazing? Let's continue with **[Core Concepts](../core-concepts/controllers.md)**! 🚀 