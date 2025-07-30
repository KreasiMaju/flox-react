# 🚀 Flox - Panduan Pemula

Panduan ini akan mengajarkan Flox dari nol sampai bisa membuat aplikasi sederhana!

## 🎯 Apa itu Flox?

Flox adalah **state management** untuk React. State management artinya cara mengelola data di aplikasi React.

**Contoh sederhana:**
- Data user (nama, email, umur)
- Data counter (angka yang bisa ditambah/kurang)
- Data loading (sedang loading atau tidak)

## ⚡ 5 Menit Belajar Flox

### Langkah 1: Install Flox
```bash
npm install flox
```

### Langkah 2: Buat Controller Pertama
```typescript
// src/controllers/CounterController.ts
import { Controller, rxInt } from 'flox';

export class CounterController extends Controller {
  // State - data yang bisa berubah
  count = rxInt(0);  // Mulai dari 0
  
  // Methods - fungsi untuk mengubah data
  increment() {
    this.count.value++;  // Tambah 1
  }
  
  decrement() {
    this.count.value--;  // Kurang 1
  }
  
  reset() {
    this.count.value = 0;  // Reset ke 0
  }
}
```

### Langkah 3: Gunakan di React Component
```typescript
// src/components/Counter.tsx
import React from 'react';
import { useController, useRx } from 'flox';
import { CounterController } from '../controllers/CounterController';

function Counter() {
  // Buat controller
  const controller = useController(new CounterController());
  
  // Ambil data dari controller
  const [count] = useRx(controller.count);
  
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => controller.increment()}>
        + Tambah
      </button>
      <button onClick={() => controller.decrement()}>
        - Kurang
      </button>
      <button onClick={() => controller.reset()}>
        Reset
      </button>
    </div>
  );
}

export default Counter;
```

### Langkah 4: Jalankan Aplikasi
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

**Selesai!** 🎉 Sekarang kamu punya aplikasi counter yang bisa ditambah, dikurang, dan di-reset!

## 🔍 Penjelasan Kode

### 1. Controller
```typescript
export class CounterController extends Controller {
  count = rxInt(0);  // ← Ini state
}
```
- **Controller** = Tempat menyimpan data dan logic
- **count** = Nama state
- **rxInt(0)** = State bertipe number, mulai dari 0
- **rx** = Reactive (otomatis update UI)

### 2. Methods
```typescript
increment() {
  this.count.value++;  // ← Mengubah state
}
```
- **Methods** = Fungsi untuk mengubah data
- **this.count.value** = Cara mengakses nilai state
- **++** = Tambah 1

### 3. React Component
```typescript
const controller = useController(new CounterController());
const [count] = useRx(controller.count);
```
- **useController** = Hook untuk membuat controller
- **useRx** = Hook untuk mengambil data dari state
- **count** = Nilai state yang bisa digunakan di UI

## 🎨 Contoh Lebih Lengkap

### User Profile Controller
```typescript
import { Controller, rxString, rxInt, rxBool } from 'flox';

export class UserController extends Controller {
  // State
  name = rxString('');        // String
  age = rxInt(0);            // Number
  isLoggedIn = rxBool(false); // Boolean
  
  // Methods
  login(userName: string, userAge: number) {
    this.name.value = userName;
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

### User Profile Component
```typescript
import React, { useState } from 'react';
import { useController, useRx } from 'flox';
import { UserController } from '../controllers/UserController';

function UserProfile() {
  const controller = useController(new UserController());
  const [name] = useRx(controller.name);
  const [age] = useRx(controller.age);
  const [isLoggedIn] = useRx(controller.isLoggedIn);
  
  const [inputName, setInputName] = useState('');
  const [inputAge, setInputAge] = useState('');
  
  const handleLogin = () => {
    controller.login(inputName, parseInt(inputAge));
  };
  
  const handleLogout = () => {
    controller.logout();
  };
  
  const handleUpdateAge = () => {
    controller.updateAge(parseInt(inputAge));
  };
  
  return (
    <div>
      <h1>User Profile</h1>
      
      {!isLoggedIn ? (
        <div>
          <h2>Login</h2>
          <input
            placeholder="Nama"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <input
            placeholder="Umur"
            type="number"
            value={inputAge}
            onChange={(e) => setInputAge(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {name}!</h2>
          <p>Umur: {age} tahun</p>
          
          <div>
            <input
              placeholder="Umur baru"
              type="number"
              value={inputAge}
              onChange={(e) => setInputAge(e.target.value)}
            />
            <button onClick={handleUpdateAge}>Update Umur</button>
          </div>
          
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
```

## 🎯 Tipe Data Rx

```typescript
import { rxInt, rxString, rxBool, rx } from 'flox';

// Tipe dasar
const count = rxInt(0);        // Number
const name = rxString('');     // String
const active = rxBool(false);  // Boolean

// Tipe custom
const user = rx({ name: '', age: 0 });  // Object
const items = rx<string[]>([]);         // Array
```

## 🔧 Tips & Trik

### 1. Naming Convention
```typescript
// ✅ Bagus
export class UserController extends Controller {}
export class ProductController extends Controller {}

// ❌ Jangan
export class userController extends Controller {}
export class MyController extends Controller {}
```

### 2. State Naming
```typescript
// ✅ Bagus
name = rxString('');
isLoading = rxBool(false);
userList = rx<User[]>([]);

// ❌ Jangan
n = rxString('');
loading = rxBool(false);
list = rx<User[]>([]);
```

### 3. Method Naming
```typescript
// ✅ Bagus
login() {}
logout() {}
updateProfile() {}
fetchData() {}

// ❌ Jangan
doLogin() {}
handleLogout() {}
update() {}
get() {}
```

## 🚀 Langkah Selanjutnya

Setelah menguasai dasar, kamu bisa belajar:

1. **Binding** - Cara mengelola banyak controller
2. **Get Utilities** - Snackbar, dialog, loading
3. **Background Workers** - Task di background
4. **Rx Operators** - Transform dan filter data

Lihat dokumentasi lengkap di [README.md](./README.md) untuk informasi lebih detail!

## ❓ FAQ

**Q: Kenapa pakai Flox, bukan Redux?**
A: Flox lebih sederhana dan mudah dipelajari. Tidak perlu setup yang rumit!

**Q: Apakah Flox bisa untuk aplikasi besar?**
A: Ya! Flox didesain untuk scalable dan performant.

**Q: Apakah Flox support TypeScript?**
A: Ya! Flox full support TypeScript dengan type safety.

**Q: Apakah Flox free?**
A: Ya! Flox open source dan free untuk digunakan.

---

**Selamat belajar Flox!** 🎉 