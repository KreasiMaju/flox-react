# 🛠️ Panduan Instalasi Flox

Panduan lengkap untuk menginstall dan setup Flox di project React kamu!

## 📋 Daftar Isi
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Setup Project](#-setup-project)
- [Quick Test](#-quick-test)
- [Troubleshooting](#-troubleshooting)
- [Migration dari Library Lain](#-migration-dari-library-lain)

## ⚡ Prerequisites

Sebelum install Flox, pastikan kamu sudah punya:

- **Node.js** (versi 14 atau lebih baru)
- **npm** atau **yarn** atau **bun**
- **React** project (bisa create-react-app, Vite, Next.js, dll)

### Check Versions
```bash
# Check Node.js version
node --version  # Harus >= 14

# Check npm version
npm --version

# Check React version (dalam project)
npm list react
```

## 🚀 Installation

### Method 1: NPM Registry (Recommended)
```bash
# Install dari NPM registry
npm install @flox/react

# Atau dengan Yarn
yarn add @flox/react

# Atau dengan Bun
bun add @flox/react

# Atau dengan PNPM
pnpm add @flox/react
```

### Method 2: Git Repository
```bash
# Install langsung dari GitHub
npm install https://github.com/your-username/flox.git

# Atau dengan Yarn
yarn add https://github.com/your-username/flox.git

# Atau dengan Bun
bun add https://github.com/your-username/flox.git

# Atau dengan PNPM
pnpm add https://github.com/your-username/flox.git
```

### Method 3: Auto Setup Script
```bash
# Download dan jalankan setup script
curl -sSL https://raw.githubusercontent.com/your-username/flox/main/scripts/setup-flox.sh | bash

# Atau untuk Windows
# Download setup-flox.bat dan double click
```

## 🎯 Setup Project

### 1. Import Flox di Project

```typescript
// src/main.tsx atau src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. Buat Controller Pertama

```typescript
// src/controllers/CounterController.ts
import { Controller, rxInt } from 'flox';

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

### 3. Buat Component dengan Flox

```typescript
// src/components/Counter.tsx
import React from 'react';
import { useController, useRx } from 'flox';
import { CounterController } from '../controllers/CounterController';

function Counter() {
  const controller = useController(new CounterController());
  const [count] = useRx(controller.count);
  
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => controller.increment()}>+</button>
      <button onClick={() => controller.decrement()}>-</button>
      <button onClick={() => controller.reset()}>Reset</button>
    </div>
  );
}

export default Counter;
```

### 4. Gunakan di App

```typescript
// src/App.tsx
import React from 'react';
import Counter from './components/Counter';

function App() {
  return (
    <div>
      <h1>Flox Demo</h1>
      <Counter />
    </div>
  );
}

export default App;
```

## ✅ Quick Test

Setelah setup, test apakah Flox berjalan dengan baik:

### 1. Jalankan Project
```bash
npm run dev
# atau
yarn dev
# atau
bun dev
```

### 2. Buka Browser
Buka `http://localhost:3000` (atau port yang ditentukan)

### 3. Test Counter
- Klik tombol `+` - counter harus bertambah
- Klik tombol `-` - counter harus berkurang
- Klik tombol `Reset` - counter harus kembali ke 0

### 4. Check Console
Buka Developer Tools → Console, seharusnya tidak ada error.

## 🔧 Setup untuk Project Types

### Create React App (CRA)
```bash
# Buat project baru
npx create-react-app my-flox-app --template typescript

# Masuk ke directory
cd my-flox-app

# Install Flox
npm install flox

# Jalankan
npm start
```

### Vite
```bash
# Buat project baru
npm create vite@latest my-flox-app -- --template react-ts

# Masuk ke directory
cd my-flox-app

# Install dependencies
npm install

# Install Flox
npm install flox

# Jalankan
npm run dev
```

### Next.js
```bash
# Buat project baru
npx create-next-app@latest my-flox-app --typescript

# Masuk ke directory
cd my-flox-app

# Install Flox
npm install flox

# Jalankan
npm run dev
```

### Existing Project
```bash
# Masuk ke project yang sudah ada
cd my-existing-project

# Install Flox
npm install flox

# Pastikan React sudah terinstall
npm list react
```

## 🎨 Setup TypeScript

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### VSCode Extensions (Optional)
Install extensions ini untuk development yang lebih baik:
- **TypeScript Importer**
- **Auto Rename Tag**
- **ES7+ React/Redux/React-Native snippets**

## 🚨 Troubleshooting

### Error: "Cannot find module 'flox'"
```bash
# Pastikan Flox terinstall
npm list flox

# Jika tidak ada, install ulang
npm install flox

# Clear cache jika perlu
npm cache clean --force
```

### Error: "React is not defined"
```bash
# Pastikan React terinstall
npm install react react-dom

# Pastikan import React ada
import React from 'react';
```

### TypeScript Errors
```bash
# Restart TypeScript server di VSCode
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Atau restart VSCode
```

### Build Errors
```bash
# Clear build cache
rm -rf node_modules/.cache
rm -rf dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Migration dari Library Lain

### Dari Redux
```bash
# Uninstall Redux
npm uninstall redux react-redux @reduxjs/toolkit

# Install Flox
npm install flox

# Hapus Redux setup dari code
# Ganti dengan Flox controllers
```

### Dari Zustand
```bash
# Uninstall Zustand
npm uninstall zustand

# Install Flox
npm install flox

# Ganti store dengan controllers
```

### Dari Context API
```bash
# Tidak perlu uninstall React
# Langsung install Flox
npm install flox

# Ganti Context dengan controllers
```

## 📁 Project Structure

Setelah install, struktur project kamu akan seperti ini:

```
my-flox-app/
├── src/
│   ├── controllers/          # ← Buat folder ini
│   │   ├── CounterController.ts
│   │   ├── UserController.ts
│   │   └── AppController.ts
│   ├── bindings/             # ← Buat folder ini (optional)
│   │   ├── AppBinding.ts
│   │   └── FeatureBinding.ts
│   ├── components/
│   │   ├── Counter.tsx
│   │   └── UserProfile.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Next Steps

Setelah berhasil install dan test:

1. **Baca dokumentasi**: [README.md](./README.md)
2. **Ikuti tutorial**: [GETTING_STARTED.md](./GETTING_STARTED.md)
3. **Lihat cheat sheet**: [CHEAT_SHEET.md](./CHEAT_SHEET.md)
4. **Buat aplikasi pertama** dengan Flox!

## ❓ FAQ

**Q: Apakah Flox compatible dengan React 18?**
A: Ya! Flox fully compatible dengan React 18 dan semua fiturnya.

**Q: Apakah Flox bisa digunakan dengan Next.js?**
A: Ya! Flox bisa digunakan di client-side Next.js components.

**Q: Apakah Flox support SSR?**
A: Flox didesain untuk client-side state management. Untuk SSR, gunakan Next.js built-in state management.

**Q: Apakah Flox bisa digunakan dengan TypeScript?**
A: Ya! Flox full support TypeScript dengan type safety.

**Q: Apakah Flox free untuk digunakan?**
A: Ya! Flox open source dan free untuk digunakan di project apapun.

---

**Selamat! Flox sudah siap digunakan di project kamu!** 🎉 