# 📝 Basic Examples

Collection of basic Flox examples to get you started with state management.

## 🎯 Counter Example

A simple counter demonstrating basic state management.

### Controller

```typescript
// src/controllers/CounterController.ts
import { Controller } from 'flox-react';
import { rxInt, rxString } from 'flox-react';

export class CounterController extends Controller {
  // State
  count = rxInt(0);
  name = rxString('User');
  
  // Computed values
  get isEven() {
    return this.count.map(x => x % 2 === 0);
  }
  
  get countText() {
    return this.count.map(x => `Count: ${x}`);
  }
  
  // Methods
  increment() {
    this.count.value++;
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
  
  // Lifecycle
  onInit() {
    console.log('CounterController initialized');
    
    // Load saved count from localStorage
    const savedCount = localStorage.getItem('counter-count');
    if (savedCount) {
      this.count.value = parseInt(savedCount, 10);
    }
  }
  
  onDispose() {
    console.log('CounterController disposed');
    
    // Save count to localStorage
    localStorage.setItem('counter-count', this.count.value.toString());
  }
}
```

### React Component

```typescript
// src/components/Counter.tsx
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { CounterController } from '../controllers/CounterController';

export const Counter: React.FC = () => {
  // Create controller instance
  const controller = useMemo(() => new CounterController(), []);
  
  // Register with React lifecycle
  const counterController = useController(controller);
  
  // Subscribe to state
  const [count] = useRx(counterController.count);
  const [name] = useRx(counterController.name);
  const [isEven] = useRx(counterController.isEven);
  const [countText] = useRx(counterController.countText);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello, {name}!</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>{countText}</h2>
        <p>Is even: {isEven ? 'Yes' : 'No'}</p>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => counterController.increment()}
            style={{ 
              marginRight: '10px', 
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ➕ Increment
          </button>
          
          <button 
            onClick={() => counterController.decrement()}
            style={{ 
              marginRight: '10px', 
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ➖ Decrement
          </button>
          
          <button 
            onClick={() => counterController.reset()}
            style={{ 
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
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
          style={{ 
            padding: '8px', 
            marginLeft: '10px',
            fontSize: '14px'
          }}
          placeholder="Enter your name"
        />
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>💡 Try changing the name or clicking the buttons!</p>
        <p>🔄 Notice how the UI updates automatically!</p>
        <p>💾 Your count will be saved to localStorage</p>
      </div>
    </div>
  );
};
```

### Usage

```typescript
// src/App.tsx
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

## 🛒 Shopping Cart Example

A shopping cart demonstrating list management and computed values.

### Types

```typescript
// src/types/cart.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
```

### Controller

```typescript
// src/controllers/CartController.ts
import { Controller } from 'flox-react';
import { rx, rxInt, rxString } from 'flox-react';
import { Product, CartItem } from '../types/cart';

export class CartController extends Controller {
  // State
  items = rx<CartItem[]>([]);
  searchTerm = rxString('');
  selectedCategory = rxString('all');
  
  // Computed values
  get totalItems() {
    return this.items.map(items => 
      items.reduce((sum, item) => sum + item.quantity, 0)
    );
  }
  
  get totalPrice() {
    return this.items.map(items => 
      items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    );
  }
  
  get isEmpty() {
    return this.items.map(items => items.length === 0);
  }
  
  get filteredItems() {
    return this.items.where(items => 
      items.filter(item => {
        const matchesSearch = item.product.name
          .toLowerCase()
          .includes(this.searchTerm.value.toLowerCase());
        
        const matchesCategory = this.selectedCategory.value === 'all' || 
          item.product.category === this.selectedCategory.value;
        
        return matchesSearch && matchesCategory;
      })
    );
  }
  
  // Methods
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.items.value.find(
      item => item.product.id === product.id
    );
    
    if (existingItem) {
      // Update existing item
      const updatedItems = this.items.value.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      this.items.value = updatedItems;
    } else {
      // Add new item
      const newItems = [...this.items.value, { product, quantity }];
      this.items.value = newItems;
    }
  }
  
  removeItem(productId: string) {
    const filteredItems = this.items.value.filter(
      item => item.product.id !== productId
    );
    this.items.value = filteredItems;
  }
  
  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    const updatedItems = this.items.value.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );
    this.items.value = updatedItems;
  }
  
  clearCart() {
    this.items.value = [];
  }
  
  setSearchTerm(term: string) {
    this.searchTerm.value = term;
  }
  
  setCategory(category: string) {
    this.selectedCategory.value = category;
  }
  
  // Lifecycle
  onInit() {
    console.log('CartController initialized');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart-items');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        this.items.value = items;
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }
  
  onDispose() {
    console.log('CartController disposed');
    
    // Save cart to localStorage
    localStorage.setItem('cart-items', JSON.stringify(this.items.value));
  }
}
```

### React Component

```typescript
// src/components/ShoppingCart.tsx
import React, { useMemo } from 'react';
import { useController, useRx } from 'flox-react';
import { CartController } from '../controllers/CartController';
import { Product } from '../types/cart';

// Sample products
const sampleProducts: Product[] = [
  { id: '1', name: 'Laptop', price: 999, category: 'electronics' },
  { id: '2', name: 'Mouse', price: 25, category: 'electronics' },
  { id: '3', name: 'Book', price: 15, category: 'books' },
  { id: '4', name: 'Pen', price: 5, category: 'office' },
  { id: '5', name: 'Notebook', price: 8, category: 'office' },
];

export const ShoppingCart: React.FC = () => {
  const controller = useMemo(() => new CartController(), []);
  const cartController = useController(controller);
  
  // Subscribe to state
  const [items] = useRx(cartController.items);
  const [totalItems] = useRx(cartController.totalItems);
  const [totalPrice] = useRx(cartController.totalPrice);
  const [isEmpty] = useRx(cartController.isEmpty);
  const [filteredItems] = useRx(cartController.filteredItems);
  const [searchTerm] = useRx(cartController.searchTerm);
  const [selectedCategory] = useRx(cartController.selectedCategory);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛒 Shopping Cart</h1>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => cartController.setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px', 
            marginRight: '10px',
            width: '200px'
          }}
        />
        
        <select 
          value={selectedCategory}
          onChange={(e) => cartController.setCategory(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
          <option value="office">Office</option>
        </select>
      </div>
      
      {/* Cart Summary */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3>Cart Summary</h3>
        <p>Total Items: {totalItems}</p>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
        <p>Items in Cart: {items.length}</p>
        
        {!isEmpty && (
          <button 
            onClick={() => cartController.clearCart()}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear Cart
          </button>
        )}
      </div>
      
      {/* Cart Items */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Cart Items</h3>
        {isEmpty ? (
          <p>Your cart is empty. Add some products below!</p>
        ) : (
          <div>
            {filteredItems.map(item => (
              <div key={item.product.id} style={{ 
                padding: '10px', 
                border: '1px solid #ddd',
                marginBottom: '10px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4>{item.product.name}</h4>
                  <p>${item.product.price} - {item.product.category}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => cartController.updateQuantity(item.product.id, item.quantity - 1)}
                    style={{ padding: '4px 8px', marginRight: '10px' }}
                  >
                    -
                  </button>
                  <span style={{ marginRight: '10px' }}>{item.quantity}</span>
                  <button 
                    onClick={() => cartController.updateQuantity(item.product.id, item.quantity + 1)}
                    style={{ padding: '4px 8px', marginRight: '10px' }}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => cartController.removeItem(item.product.id)}
                    style={{ 
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Available Products */}
      <div>
        <h3>Available Products</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {sampleProducts.map(product => (
            <div key={product.id} style={{ 
              padding: '15px', 
              border: '1px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4>{product.name}</h4>
              <p>${product.price}</p>
              <p style={{ color: '#666' }}>{product.category}</p>
              <button 
                onClick={() => cartController.addItem(product)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 📝 Todo List Example

A todo list demonstrating CRUD operations and filtering.

### Types

```typescript
// src/types/todo.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export type TodoFilter = 'all' | 'active' | 'completed';
```

### Controller

```typescript
// src/controllers/TodoController.ts
import { Controller } from 'flox-react';
import { rx, rxString, rxBool } from 'flox-react';
import { Todo, TodoFilter } from '../types/todo';

export class TodoController extends Controller {
  // State
  todos = rx<Todo[]>([]);
  newTodoText = rxString('');
  filter = rx<TodoFilter>('all');
  showCompleted = rxBool(true);
  
  // Computed values
  get filteredTodos() {
    return this.todos.where(todos => {
      let filtered = todos;
      
      // Apply filter
      if (this.filter.value === 'active') {
        filtered = filtered.filter(todo => !todo.completed);
      } else if (this.filter.value === 'completed') {
        filtered = filtered.filter(todo => todo.completed);
      }
      
      // Apply show/hide completed
      if (!this.showCompleted.value) {
        filtered = filtered.filter(todo => !todo.completed);
      }
      
      return filtered;
    });
  }
  
  get activeCount() {
    return this.todos.map(todos => 
      todos.filter(todo => !todo.completed).length
    );
  }
  
  get completedCount() {
    return this.todos.map(todos => 
      todos.filter(todo => todo.completed).length
    );
  }
  
  get totalCount() {
    return this.todos.map(todos => todos.length);
  }
  
  get isAllCompleted() {
    return this.todos.map(todos => 
      todos.length > 0 && todos.every(todo => todo.completed)
    );
  }
  
  // Methods
  addTodo(text: string) {
    if (!text.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    this.todos.value = [...this.todos.value, newTodo];
    this.newTodoText.value = '';
  }
  
  toggleTodo(id: string) {
    const updatedTodos = this.todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.todos.value = updatedTodos;
  }
  
  updateTodo(id: string, text: string) {
    if (!text.trim()) return;
    
    const updatedTodos = this.todos.value.map(todo =>
      todo.id === id ? { ...todo, text: text.trim() } : todo
    );
    this.todos.value = updatedTodos;
  }
  
  deleteTodo(id: string) {
    const filteredTodos = this.todos.value.filter(todo => todo.id !== id);
    this.todos.value = filteredTodos;
  }
  
  toggleAll() {
    const allCompleted = this.isAllCompleted.value;
    const updatedTodos = this.todos.value.map(todo => ({
      ...todo,
      completed: !allCompleted
    }));
    this.todos.value = updatedTodos;
  }
  
  clearCompleted() {
    const activeTodos = this.todos.value.filter(todo => !todo.completed);
    this.todos.value = activeTodos;
  }
  
  setFilter(filter: TodoFilter) {
    this.filter.value = filter;
  }
  
  toggleShowCompleted() {
    this.showCompleted.value = !this.showCompleted.value;
  }
  
  // Lifecycle
  onInit() {
    console.log('TodoController initialized');
    
    // Load todos from localStorage
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const todos = JSON.parse(savedTodos);
        // Convert string dates back to Date objects
        const parsedTodos = todos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        this.todos.value = parsedTodos;
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    }
  }
  
  onDispose() {
    console.log('TodoController disposed');
    
    // Save todos to localStorage
    localStorage.setItem('todos', JSON.stringify(this.todos.value));
  }
}
```

### React Component

```typescript
// src/components/TodoList.tsx
import React, { useMemo, useState } from 'react';
import { useController, useRx } from 'flox-react';
import { TodoController } from '../controllers/TodoController';
import { TodoFilter } from '../types/todo';

export const TodoList: React.FC = () => {
  const controller = useMemo(() => new TodoController(), []);
  const todoController = useController(controller);
  
  // Local state for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Subscribe to state
  const [todos] = useRx(todoController.todos);
  const [filteredTodos] = useRx(todoController.filteredTodos);
  const [newTodoText] = useRx(todoController.newTodoText);
  const [filter] = useRx(todoController.filter);
  const [showCompleted] = useRx(todoController.showCompleted);
  const [activeCount] = useRx(todoController.activeCount);
  const [completedCount] = useRx(todoController.completedCount);
  const [totalCount] = useRx(todoController.totalCount);
  const [isAllCompleted] = useRx(todoController.isAllCompleted);
  
  // Handlers
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    todoController.addTodo(newTodoText);
  };
  
  const handleEdit = (todo: any) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };
  
  const handleSaveEdit = (id: string) => {
    todoController.updateTodo(id, editText);
    setEditingId(null);
    setEditText('');
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📝 Todo List</h1>
      
      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => todoController.newTodoText.value = e.target.value}
            placeholder="What needs to be done?"
            style={{ 
              flex: 1, 
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </form>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          {(['all', 'active', 'completed'] as TodoFilter[]).map(filterOption => (
            <button
              key={filterOption}
              onClick={() => todoController.setFilter(filterOption)}
              style={{ 
                padding: '8px 16px',
                backgroundColor: filter === filterOption ? '#007bff' : '#f8f9fa',
                color: filter === filterOption ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => todoController.toggleShowCompleted()}
          />
          Show completed todos
        </label>
      </div>
      
      {/* Todo List */}
      {totalCount > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={isAllCompleted}
                onChange={() => todoController.toggleAll()}
              />
              <strong>Toggle All</strong>
            </label>
          </div>
          
          {filteredTodos.map(todo => (
            <div key={todo.id} style={{ 
              padding: '10px', 
              border: '1px solid #ddd',
              marginBottom: '5px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => todoController.toggleTodo(todo.id)}
              />
              
              {editingId === todo.id ? (
                <div style={{ display: 'flex', flex: 1, gap: '5px' }}>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ flex: 1, padding: '5px' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(todo.id)}
                    onBlur={() => handleSaveEdit(todo.id)}
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(todo.id)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <span 
                  style={{ 
                    flex: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#666' : '#333'
                  }}
                  onDoubleClick={() => handleEdit(todo)}
                >
                  {todo.text}
                </span>
              )}
              
              <button 
                onClick={() => todoController.deleteTodo(todo.id)}
                style={{ 
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <p>Total: {totalCount} | Active: {activeCount} | Completed: {completedCount}</p>
        
        {completedCount > 0 && (
          <button 
            onClick={() => todoController.clearCompleted()}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Completed
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div style={{ fontSize: '14px', color: '#666' }}>
        <p>💡 Double-click a todo to edit it</p>
        <p>✅ Check the checkbox to mark as complete</p>
        <p>🗑️ Click delete to remove a todo</p>
        <p>💾 Your todos are automatically saved</p>
      </div>
    </div>
  );
};
```

## 🔄 Next Steps

Now that you've seen basic examples, explore:

1. **[Advanced Examples](./advanced-examples.md)** - Complex real-world scenarios
2. **[E-commerce App](./ecommerce-app.md)** - Complete application example
3. **[Real-time Chat](./realtime-chat.md)** - WebSocket integration
4. **[Performance Optimization](../advanced/performance.md)** - Optimize your apps

---

**🎉 You've mastered basic Flox examples! Ready for advanced patterns?** 🚀 