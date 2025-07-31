# 🔄 Migration Guide

Quick guide to migrate from other state management libraries to Flox.

## 📦 From Redux

### Key Differences

| Redux | Flox |
|-------|------|
| Single global store | Multiple controllers |
| Actions & reducers | Direct method calls |
| `useSelector` | `useRx` |
| `useDispatch` | Direct controller methods |

### Migration Example

#### Before: Redux
```typescript
// Redux slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

// Component
const count = useSelector((state) => state.counter.value);
const dispatch = useDispatch();
<button onClick={() => dispatch(increment())}>+</button>
```

#### After: Flox
```typescript
// Flox controller
export class CounterController extends Controller {
  count = rxInt(0);
  
  increment() { this.count.value++; }
  decrement() { this.count.value--; }
}

// Component
const controller = useMemo(() => new CounterController(), []);
const counterController = useController(controller);
const [count] = useRx(counterController.count);
<button onClick={() => counterController.increment()}>+</button>
```

## 📦 From Zustand

### Migration Example

#### Before: Zustand
```typescript
// Store
const useStore = create((set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
}));

// Component
const { bears, addBear } = useStore();
<button onClick={addBear}>Add Bear</button>
```

#### After: Flox
```typescript
// Controller
export class BearController extends Controller {
  bears = rxInt(0);
  addBear() { this.bears.value++; }
}

// Component
const controller = useMemo(() => new BearController(), []);
const bearController = useController(controller);
const [bears] = useRx(bearController.bears);
<button onClick={() => bearController.addBear()}>Add Bear</button>
```

## 📦 From MobX

### Migration Example

#### Before: MobX
```typescript
// Store
class TodoStore {
  @observable todos = [];
  
  @computed get completedCount() {
    return this.todos.filter(t => t.completed).length;
  }
  
  @action addTodo(text) {
    this.todos.push({ id: Date.now(), text, completed: false });
  }
}

// Component
const { todos, completedCount, addTodo } = todoStore;
```

#### After: Flox
```typescript
// Controller
export class TodoController extends Controller {
  todos = rx<Todo[]>([]);
  
  get completedCount() {
    return this.todos.map(todos => 
      todos.filter(t => t.completed).length
    );
  }
  
  addTodo(text: string) {
    const newTodo = { id: Date.now(), text, completed: false };
    this.todos.value = [...this.todos.value, newTodo];
  }
}

// Component
const controller = useMemo(() => new TodoController(), []);
const todoController = useController(controller);
const [todos] = useRx(todoController.todos);
const [completedCount] = useRx(todoController.completedCount);
```

## 📦 From Context API

### Migration Example

#### Before: Context
```typescript
// Context
const ThemeContext = createContext();
const [theme, setTheme] = useState('light');
<ThemeContext.Provider value={{ theme, setTheme }}>
  {children}
</ThemeContext.Provider>

// Component
const { theme, setTheme } = useContext(ThemeContext);
```

#### After: Flox
```typescript
// Controller
export class ThemeController extends Controller {
  theme = rxString('light');
  setTheme(theme: string) { this.theme.value = theme; }
}

// Component
const controller = useMemo(() => new ThemeController(), []);
const themeController = useController(controller);
const [theme] = useRx(themeController.theme);
```

## 🔄 Migration Checklist

### Before Migration
- [ ] Audit current state management
- [ ] Plan migration strategy
- [ ] Set up Flox environment

### During Migration
- [ ] Create Flox controllers
- [ ] Update components
- [ ] Test thoroughly

### After Migration
- [ ] Clean up old code
- [ ] Optimize performance
- [ ] Update documentation

## 🆘 Common Issues

### 1. UI Not Updating
```typescript
// ❌ Wrong
const count = controller.count.value;

// ✅ Correct
const [count] = useRx(controller.count);
```

### 2. Controller Not Initializing
```typescript
// ❌ Wrong
const controller = new CounterController();

// ✅ Correct
const controller = useMemo(() => new CounterController(), []);
const counterController = useController(controller);
```

### 3. Memory Leaks
```typescript
// ✅ Correct - Clean up in onDispose
export class MyController extends Controller {
  private listeners: (() => void)[] = [];
  
  onInit() {
    const cleanup = window.addEventListener('resize', this.handleResize);
    this.listeners.push(cleanup);
  }
  
  onDispose() {
    this.listeners.forEach(cleanup => cleanup());
  }
}
```

## 🔄 Next Steps

1. **[Basic Examples](../examples/basic-examples.md)** - Learn Flox patterns
2. **[API Reference](../api/controller.md)** - Master the APIs
3. **[Best Practices](./best-practices.md)** - Follow conventions
4. **[Community](https://github.com/KreasiMaju/flox-react/discussions)** - Get help

---

**🎉 Migration complete! Welcome to Flox!** 🚀 