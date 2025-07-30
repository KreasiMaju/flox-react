#!/bin/bash

# 🚀 Flox Setup Script
# Script untuk setup Flox di project React baru

echo "🚀 Flox Setup Script"
echo "===================="

# Check if we're in a React project
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json tidak ditemukan!"
    echo "Pastikan kamu berada di root directory project React"
    exit 1
fi

# Check if React is installed
if ! grep -q "react" package.json; then
    echo "❌ Error: React tidak ditemukan di package.json!"
    echo "Pastikan ini adalah project React"
    exit 1
fi

# Check if Flox is already installed
if grep -q "flox" package.json; then
    echo "✅ Flox sudah terinstall!"
    exit 0
fi

echo "📦 Installing Flox..."
npm install flox

if [ $? -eq 0 ]; then
    echo "✅ Flox berhasil diinstall!"
else
    echo "❌ Gagal install Flox"
    exit 1
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p src/controllers
mkdir -p src/bindings
mkdir -p src/components

# Create sample controller
echo "🎮 Creating sample controller..."
cat > src/controllers/CounterController.ts << 'EOF'
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
EOF

# Create sample component
echo "🎨 Creating sample component..."
cat > src/components/Counter.tsx << 'EOF'
import React from 'react';
import { useController, useRx } from 'flox';
import { CounterController } from '../controllers/CounterController';

function Counter() {
  const controller = useController(new CounterController());
  const [count] = useRx(controller.count);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Flox Counter Demo</h1>
      <h2>Count: {count}</h2>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => controller.increment()}
          style={{ margin: '0 10px', padding: '10px 20px' }}
        >
          + Increment
        </button>
        <button 
          onClick={() => controller.decrement()}
          style={{ margin: '0 10px', padding: '10px 20px' }}
        >
          - Decrement
        </button>
        <button 
          onClick={() => controller.reset()}
          style={{ margin: '0 10px', padding: '10px 20px' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default Counter;
EOF

# Create sample binding
echo "🔗 Creating sample binding..."
cat > src/bindings/AppBinding.ts << 'EOF'
import { Binding } from 'flox';
import { CounterController } from '../controllers/CounterController';

export class AppBinding extends Binding {
  dependencies() {
    this.putController('counter', new CounterController());
  }
}
EOF

# Update App.tsx if it exists
if [ -f "src/App.tsx" ]; then
    echo "📝 Updating App.tsx..."
    cat > src/App.tsx << 'EOF'
import React from 'react';
import Counter from './components/Counter';

function App() {
  return (
    <div className="App">
      <Counter />
    </div>
  );
}

export default App;
EOF
fi

# Create README for the project
echo "📚 Creating project README..."
cat > FLOX_README.md << 'EOF'
# 🚀 Flox Project Setup

Project ini sudah disetup dengan Flox state management!

## 🎯 What's Included

- ✅ Flox library installed
- ✅ Sample CounterController
- ✅ Sample Counter component
- ✅ Sample AppBinding
- ✅ Updated App.tsx

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# atau
npm start
```

## 📁 Project Structure

```
src/
├── controllers/
│   └── CounterController.ts    # Sample controller
├── bindings/
│   └── AppBinding.ts          # Sample binding
├── components/
│   └── Counter.tsx            # Sample component
└── App.tsx                    # Main app
```

## 🎮 Test Flox

1. Buka browser ke `http://localhost:3000`
2. Klik tombol Increment/Decrement/Reset
3. Lihat counter berubah secara real-time!

## 📖 Next Steps

- Baca dokumentasi: [README.md](./README.md)
- Ikuti tutorial: [GETTING_STARTED.md](./GETTING_STARTED.md)
- Lihat cheat sheet: [CHEAT_SHEET.md](./CHEAT_SHEET.md)

## 🛠️ Development

```bash
# Create new controller
touch src/controllers/MyController.ts

# Create new component
touch src/components/MyComponent.tsx

# Create new binding
touch src/bindings/MyBinding.ts
```

Happy coding with Flox! 🎉
EOF

echo ""
echo "🎉 Setup selesai! Flox berhasil disetup di project kamu!"
echo ""
echo "📁 Files yang dibuat:"
echo "  - src/controllers/CounterController.ts"
echo "  - src/components/Counter.tsx"
echo "  - src/bindings/AppBinding.ts"
echo "  - FLOX_README.md"
echo ""
echo "🚀 Langkah selanjutnya:"
echo "  1. npm run dev (atau npm start)"
echo "  2. Buka http://localhost:3000"
echo "  3. Test counter app!"
echo ""
echo "📖 Dokumentasi:"
echo "  - README.md - Dokumentasi lengkap"
echo "  - GETTING_STARTED.md - Tutorial pemula"
echo "  - CHEAT_SHEET.md - Referensi cepat"
echo "  - INSTALLATION.md - Panduan instalasi"
echo ""
echo "Happy coding with Flox! 🎉" 