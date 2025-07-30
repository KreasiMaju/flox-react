# 🚀 Flox Cheat Sheet

Referensi cepat untuk Flox - React State Management

## 📦 Import

```typescript
import { 
  Controller, 
  rxInt, rxString, rxBool, rx,
  useController, useRx, useRxValue,
  Get, BackgroundWorker 
} from 'flox';
```

## 🎮 Controller

### Basic Controller
```typescript
export class MyController extends Controller {
  // State
  count = rxInt(0);
  name = rxString('');
  active = rxBool(false);
  
  // Methods
  increment() {
    this.count.value++;
  }
  
  updateName(newName: string) {
    this.name.value = newName;
  }
  
  // Lifecycle
  onInit() {
    console.log('Controller ready!');
  }
  
  onDispose() {
    console.log('Controller disposed!');
  }
}
```

### Advanced Controller
```typescript
export class AdvancedController extends Controller {
  constructor() {
    super();
    this.createSubject('user', null);
    this.createSubject('loading', false);
  }
  
  async fetchUser(id: string) {
    this.updateSubject('loading', true);
    try {
      const user = await api.getUser(id);
      this.updateSubject('user', user);
    } finally {
      this.updateSubject('loading', false);
    }
  }
}
```

## 🔄 Rx Variables

### Tipe Data
```typescript
const count = rxInt(0);                    // number
const name = rxString('');                 // string
const active = rxBool(false);              // boolean
const user = rx({ name: '', age: 0 });     // object
const items = rx<string[]>([]);            // array
```

### Operators
```typescript
const count = rxInt(5);

// Map - transform
const doubled = count.map(x => x * 2);

// Where - filter
const isEven = count.map(x => x % 2 === 0);

// Update - modify
count.update(x => x + 10);
```

### Methods
```typescript
// Get/set value
console.log(count.value);
count.value = 10;

// Subscribe
const unsubscribe = count.subscribe(value => {
  console.log('New value:', value);
});

// Dispose
count.dispose();
```

## 🎣 React Hooks

### useController
```typescript
const controller = useController(new MyController());
```

### useRx
```typescript
// Get value dan setter
const [count, setCount] = useRx(controller.count);

// Hanya get value
const count = useRxValue(controller.count);
```

### useSubject
```typescript
const [user, setUser] = useSubject(
  controller.getSubjectPublic('user')
);
```

## 🔗 Binding

### Basic Binding
```typescript
export class AppBinding extends Binding {
  dependencies() {
    this.putController('user', new UserController());
    this.putFenix('temp', () => new TempController());
    this.putPermanent('app', new AppController());
    this.lazyPut('settings', () => new SettingsController());
  }
}
```

### Use Binding
```typescript
const binding = useBinding('app', new AppBinding());
const userController = binding.getControllerPublic('user');
```

## 🛠️ Get Utilities

### Controller Management
```typescript
// Register
Get.put('user', new UserController());

// Get
const controller = Get.find<UserController>('user');

// Check
if (Get.isRegistered('user')) {
  console.log('Exists!');
}

// Delete
Get.delete('user');
```

### UI Utilities
```typescript
// Snackbar
Get.snackbar('Success!', 3000);

// Dialog
const confirmed = await Get.dialog('Title', 'Message');

// Loading
Get.loading('Loading...');
Get.closeLoading();
```

## ⚙️ Background Workers

```typescript
// Create
BackgroundWorker.create('task', async () => {
  await heavyTask();
  Get.snackbar('Done!');
});

// Control
BackgroundWorker.start('task');
BackgroundWorker.stop('task');
BackgroundWorker.delete('task');

// Check
if (BackgroundWorker.isRunning('task')) {
  console.log('Running...');
}
```

## 🎯 Patterns

### Counter Pattern
```typescript
export class CounterController extends Controller {
  count = rxInt(0);
  
  increment() { this.count.value++; }
  decrement() { this.count.value--; }
  reset() { this.count.value = 0; }
}
```

### Loading Pattern
```typescript
export class DataController extends Controller {
  data = rx<any[]>([]);
  loading = rxBool(false);
  error = rxString('');
  
  async fetchData() {
    this.loading.value = true;
    this.error.value = '';
    
    try {
      const result = await api.getData();
      this.data.value = result;
    } catch (err) {
      this.error.value = err.message;
    } finally {
      this.loading.value = false;
    }
  }
}
```

### Form Pattern
```typescript
export class FormController extends Controller {
  name = rxString('');
  email = rxString('');
  isValid = rxBool(false);
  
  updateName(name: string) {
    this.name.value = name;
    this.validate();
  }
  
  updateEmail(email: string) {
    this.email.value = email;
    this.validate();
  }
  
  private validate() {
    this.isValid.value = 
      this.name.value.length > 0 && 
      this.email.value.includes('@');
  }
}
```

### List Pattern
```typescript
export class ListController extends Controller {
  items = rx<any[]>([]);
  selectedItem = rx<any>(null);
  
  addItem(item: any) {
    this.items.value = [...this.items.value, item];
  }
  
  removeItem(id: string) {
    this.items.value = this.items.value.filter(item => item.id !== id);
  }
  
  selectItem(item: any) {
    this.selectedItem.value = item;
  }
}
```

## 🔧 Best Practices

### Naming
```typescript
// ✅ Good
export class UserController extends Controller {}
export class ProductController extends Controller {}
const userName = rxString('');
const isActive = rxBool(false);

// ❌ Bad
export class userController extends Controller {}
export class MyController extends Controller {}
const name = rxString('');
const active = rxBool(false);
```

### Structure
```typescript
export class GoodController extends Controller {
  // 1. State first
  count = rxInt(0);
  name = rxString('');
  
  // 2. Computed properties
  get displayName() {
    return this.name.value || 'Anonymous';
  }
  
  // 3. Public methods
  increment() {
    this.count.value++;
  }
  
  // 4. Private methods
  private validate() {
    // validation logic
  }
  
  // 5. Lifecycle
  onInit() {
    // initialization
  }
  
  onDispose() {
    // cleanup
  }
}
```

### Error Handling
```typescript
export class SafeController extends Controller {
  async riskyOperation() {
    try {
      this.updateSubject('loading', true);
      const result = await api.call();
      this.updateSubject('data', result);
    } catch (error) {
      this.updateSubject('error', error);
      Get.snackbar('Error occurred!');
    } finally {
      this.updateSubject('loading', false);
    }
  }
}
```

## 🚀 Migration

### From Redux
```typescript
// ❌ Redux
const mapStateToProps = (state) => ({
  count: state.counter.count
});
const mapDispatchToProps = (dispatch) => ({
  increment: () => dispatch(increment())
});

// ✅ Flox
const controller = useController(new CounterController());
const [count] = useRx(controller.count);
controller.increment();
```

### From Zustand
```typescript
// ❌ Zustand
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// ✅ Flox
export class CounterController extends Controller {
  count = rxInt(0);
  increment() {
    this.count.value++;
  }
}
```

## 📚 Quick Reference

### Rx Types
- `rxInt(0)` - number
- `rxString('')` - string
- `rxBool(false)` - boolean
- `rx({})` - object
- `rx([])` - array

### Binding Types
- `putController()` - Normal
- `putFenix()` - Recreate each time
- `putPermanent()` - Never disposed
- `lazyPut()` - Lazy initialization

### Get Methods
- `Get.put()` - Register controller
- `Get.find()` - Get controller
- `Get.delete()` - Remove controller
- `Get.snackbar()` - Show snackbar
- `Get.dialog()` - Show dialog
- `Get.loading()` - Show loading

### Worker Methods
- `BackgroundWorker.create()` - Create worker
- `BackgroundWorker.start()` - Start worker
- `BackgroundWorker.stop()` - Stop worker
- `BackgroundWorker.delete()` - Delete worker
- `BackgroundWorker.isRunning()` - Check status

---

**Flox Cheat Sheet** - Referensi cepat untuk development! 🚀 