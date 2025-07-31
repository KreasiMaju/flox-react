# 🛠️ Installation Guide

Complete guide to install and set up Flox in your React project.

## 📋 Prerequisites

### System Requirements

- **Node.js** - Version 16.0.0 or higher
- **npm** - Version 7.0.0 or higher (comes with Node.js)
- **React** - Version 16.8.0 or higher (for hooks support)

### Verify Your Environment

```bash
# Check Node.js version
node --version
# Should be >= 16.0.0

# Check npm version
npm --version
# Should be >= 7.0.0

# Check if you have a React project
ls package.json
# Should exist and contain React dependencies
```

## ⚡ Installation Methods

### Method 1: NPM Registry (Recommended)

```bash
# Using npm
npm install flox-react

# Using yarn
yarn add flox-react

# Using bun (fastest)
bun add flox-react

# Using pnpm
pnpm add flox-react
```

### Method 2: Git Repository

```bash
# Install directly from GitHub
npm install https://github.com/KreasiMaju/flox-react.git

# Or with specific branch
npm install https://github.com/KreasiMaju/flox-react.git#main
```

### Method 3: Auto Setup Script

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/KreasiMaju/flox-react/main/scripts/setup-flox.sh | bash

# For Windows (PowerShell)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/KreasiMaju/flox-react/main/scripts/setup-flox.bat" -OutFile "setup-flox.bat"
.\setup-flox.bat
```

## 🎯 Project Setup by Type

### Create React App (CRA)

```bash
# Create new project
npx create-react-app my-flox-app --template typescript
cd my-flox-app

# Install Flox
npm install flox-react

# Start development
npm start
```

### Vite

```bash
# Create new project
npm create vite@latest my-flox-app -- --template react-ts
cd my-flox-app

# Install dependencies
npm install

# Install Flox
npm install flox-react

# Start development
npm run dev
```

### Next.js

```bash
# Create new project
npx create-next-app@latest my-flox-app --typescript
cd my-flox-app

# Install Flox
npm install flox-react

# Start development
npm run dev
```

### Existing React Project

```bash
# Navigate to your project
cd your-existing-react-project

# Install Flox
npm install flox-react

# Verify installation
npm list flox-react
```

## 🔧 TypeScript Setup

### Automatic Setup

Flox includes TypeScript definitions, so no additional setup is needed for most projects.

### Manual TypeScript Configuration

If you need custom TypeScript settings, update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🧪 Quick Test

After installation, test if Flox is working correctly:

### Step 1: Create Test File

Create `src/test-flox.tsx`:

```typescript
import React from 'react';
import { Controller, useController, useRx, rxInt } from 'flox-react';

// Simple test controller
class TestController extends Controller {
  count = rxInt(0);
  
  increment() {
    this.count.value++;
  }
}

// Test component
export const TestFlox: React.FC = () => {
  const controller = useController(new TestController());
  const [count] = useRx(controller.count);

  return (
    <div>
      <h2>Flox Test</h2>
      <p>Count: {count}</p>
      <button onClick={() => controller.increment()}>
        Increment
      </button>
    </div>
  );
};
```

### Step 2: Use in App

Update your `src/App.tsx`:

```typescript
import React from 'react';
import { TestFlox } from './test-flox';

function App() {
  return (
    <div className="App">
      <h1>Flox Installation Test</h1>
      <TestFlox />
    </div>
  );
}

export default App;
```

### Step 3: Run and Test

```bash
# Start your development server
npm start
# or
yarn start
# or
bun dev
```

Visit your app and click the "Increment" button. If the count increases, Flox is working correctly! 🎉

## 📁 Recommended Project Structure

After installation, organize your project like this:

```
src/
├── controllers/          # Business logic and state
│   ├── UserController.ts
│   ├── ProductController.ts
│   └── CartController.ts
├── bindings/            # Dependency injection
│   ├── AppBinding.ts
│   └── FeatureBinding.ts
├── components/          # React components
│   ├── UserProfile.tsx
│   └── ProductList.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   └── ShopPage.tsx
├── hooks/              # Custom React hooks
│   └── useCustomHook.ts
├── utils/              # Utility functions
│   └── helpers.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main app component
```

## 🔄 Migration from Other Libraries

### From Redux

```typescript
// ❌ Redux way
import { useSelector, useDispatch } from 'react-redux';

const Counter = () => {
  const count = useSelector(state => state.counter.count);
  const dispatch = useDispatch();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>
        Increment
      </button>
    </div>
  );
};

// ✅ Flox way
import { useController, useRx } from 'flox-react';

const Counter = () => {
  const controller = useController(new CounterController());
  const [count] = useRx(controller.count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => controller.increment()}>
        Increment
      </button>
    </div>
  );
};
```

### From Zustand

```typescript
// ❌ Zustand way
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// ✅ Flox way
import { Controller, rxInt } from 'flox-react';

export class CounterController extends Controller {
  count = rxInt(0);
  
  increment() {
    this.count.value++;
  }
}
```

### From Context API

```typescript
// ❌ Context way
const CounterContext = createContext();

const Counter = () => {
  const { count, increment } = useContext(CounterContext);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

// ✅ Flox way
const Counter = () => {
  const controller = useController(new CounterController());
  const [count] = useRx(controller.count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => controller.increment()}>Increment</button>
    </div>
  );
};
```

## 🆘 Troubleshooting

### Common Installation Issues

**❌ Error: "Cannot find module 'flox-react'"**

```bash
# Solution 1: Clear cache and reinstall
npm cache clean --force
npm install flox-react

# Solution 2: Check package.json
cat package.json | grep flox-react

# Solution 3: Try different package manager
yarn add flox-react
# or
bun add flox-react
```

**❌ Error: "Module not found" in TypeScript**

```typescript
// Make sure you're importing correctly
import { Controller, useController, useRx } from 'flox-react';
// NOT: import { Controller } from 'flox-react/Controller';
```

**❌ Error: "React is not defined"**

```typescript
// Add React import if needed
import React from 'react';
// Or use automatic JSX transform (React 17+)
```

**❌ Error: "Cannot use import statement outside a module"**

```json
// Add "type": "module" to package.json
{
  "type": "module",
  "dependencies": {
    "flox-react": "^1.0.0"
  }
}
```

### Build Issues

**❌ Error: "Unexpected token" during build**

```bash
# Check your bundler configuration
# For Webpack, make sure you have proper loaders
# For Vite, should work out of the box
```

**❌ Error: "TypeScript compilation failed"**

```bash
# Check TypeScript version
npx tsc --version

# Should be >= 4.5.0 for best compatibility
```

### Performance Issues

**❌ Slow development server**

```bash
# Use bun for faster package management
bun add flox-react
bun dev

# Or use pnpm for efficient disk usage
pnpm add flox-react
pnpm dev
```

## 📞 Getting Help

If you're still having issues:

1. **Check the [Quick Start Guide](./quick-start.md)** for basic setup
2. **Review [Common Problems](../advanced/debugging.md)** for solutions
3. **Search [GitHub Issues](https://github.com/KreasiMaju/flox-react/issues)** for similar problems
4. **Ask in [GitHub Discussions](https://github.com/KreasiMaju/flox-react/discussions)**
5. **Create a new issue** with detailed error information

### When Creating an Issue

Include this information:

```markdown
## Environment
- Node.js version: `node --version`
- Package manager: npm/yarn/bun/pnpm
- React version: (from package.json)
- TypeScript version: (if using)

## Error Details
- Error message: (full error)
- Steps to reproduce: (detailed steps)
- Expected behavior: (what should happen)
- Actual behavior: (what actually happens)

## Code Example
```typescript
// Your code here
```
```

---

**🎉 Installation complete! Ready to build amazing apps with Flox?**

Next: **[Quick Start Guide](./quick-start.md)** to create your first Flox app! 🚀 