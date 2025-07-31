# 🔍 Flox Monitoring System

Sistem monitoring real-time untuk mendeteksi kesalahan implementasi dan memberikan feedback visual.

## 🎯 Overview

Flox Monitor adalah sistem monitoring yang dapat mendeteksi berbagai masalah dalam implementasi Flox secara otomatis dan memberikan feedback visual yang jelas kepada developer.

### ✨ Fitur Utama

- **🔍 Pattern Detection** - Mendeteksi anti-pattern secara otomatis
- **⚡ Performance Monitoring** - Memantau performa komponen
- **🧠 Memory Monitoring** - Mendeteksi memory leaks
- **🚨 Error Boundary** - Menangkap error JavaScript
- **📊 Visual Dashboard** - Interface monitoring yang interaktif
- **💡 Smart Suggestions** - Memberikan saran perbaikan

## 🚀 Quick Start

### 1. Setup Basic Monitoring

```typescript
import { useFloxMonitor } from 'flox';

export const MyComponent: React.FC = () => {
  const { reportError, reportWarning } = useFloxMonitor({
    componentName: 'MyComponent'
  });
  
  // Component logic...
};
```

### 2. Add Dashboard

```typescript
import { FloxMonitorDashboard } from 'flox';

export const App: React.FC = () => {
  return (
    <div>
      <MyComponent />
      <FloxMonitorDashboard />
    </div>
  );
};
```

### 3. Enable Advanced Monitoring

```typescript
import { 
  useFloxPerformanceMonitor, 
  useFloxMemoryMonitor, 
  useFloxErrorBoundary 
} from 'flox';

export const MyComponent: React.FC = () => {
  // Performance monitoring
  useFloxPerformanceMonitor('MyComponent');
  
  // Memory monitoring
  useFloxMemoryMonitor('MyComponent');
  
  // Error boundary
  useFloxErrorBoundary('MyComponent');
  
  // Component logic...
};
```

## 🔧 API Reference

### useFloxMonitor

Hook utama untuk monitoring komponen.

```typescript
function useFloxMonitor(options?: UseFloxMonitorOptions): {
  errors: FloxError[];
  warnings: FloxWarning[];
  stats: FloxMonitorStats;
  hasErrors: boolean;
  hasWarnings: boolean;
  totalIssues: number;
  detectPatterns: (code: string, context?: { component?: string; controller?: string }) => void;
  reportError: (error: Omit<FloxError, 'id' | 'timestamp'>) => void;
  reportWarning: (warning: Omit<FloxWarning, 'id' | 'timestamp'>) => void;
  enableMonitoring: () => void;
  disableMonitoring: () => void;
  clearErrors: () => void;
  clearWarnings: () => void;
  componentErrors: FloxError[];
  componentWarnings: FloxWarning[];
}
```

#### Options

```typescript
interface UseFloxMonitorOptions {
  enablePatternDetection?: boolean; // Default: true
  enablePerformanceMonitoring?: boolean; // Default: true
  enableVisualFeedback?: boolean; // Default: true
  componentName?: string;
}
```

### useFloxPerformanceMonitor

Hook untuk monitoring performa komponen.

```typescript
function useFloxPerformanceMonitor(componentName: string): void
```

**Deteksi Otomatis:**
- Render time > 16ms (60fps threshold)
- Re-render frequency > 50x dalam 5 detik

### useFloxMemoryMonitor

Hook untuk monitoring penggunaan memori.

```typescript
function useFloxMemoryMonitor(componentName: string): void
```

**Deteksi Otomatis:**
- Memory usage > 85% dari heap limit

### useFloxErrorBoundary

Hook untuk menangkap error JavaScript.

```typescript
function useFloxErrorBoundary(componentName: string): void
```

**Deteksi Otomatis:**
- JavaScript errors
- Unhandled promise rejections

## 🔍 Pattern Detection

Sistem ini dapat mendeteksi berbagai anti-pattern secara otomatis:

### 1. Controller Created Every Render

```typescript
// ❌ Bad - Will trigger warning
export const BadComponent: React.FC = () => {
  const controller = new UserController(); // Bad pattern
  // ...
};

// ✅ Good
export const GoodComponent: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  // ...
};
```

### 2. Direct Rx Access

```typescript
// ❌ Bad - Will trigger error
export const BadComponent: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const user = controller.user.value; // Direct access
  return <div>{user?.name}</div>;
};

// ✅ Good
export const GoodComponent: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const [user] = useRx(controller.user);
  return <div>{user?.name}</div>;
};
```

### 3. Missing useController

```typescript
// ❌ Bad - Will trigger error
export const BadComponent: React.FC = () => {
  const controller = new UserController();
  const [user] = useRx(controller.user); // Missing useController
  // ...
};

// ✅ Good
export const GoodComponent: React.FC = () => {
  const controller = useMemo(() => new UserController(), []);
  const userController = useController(controller);
  const [user] = useRx(userController.user);
  // ...
};
```

### 4. Expensive Computations

```typescript
// ❌ Bad - Will trigger warning
export const BadComponent: React.FC = () => {
  const expensiveValue = data
    .filter(item => complexFilter(item))
    .map(item => complexTransform(item))
    .reduce((sum, item) => sum + item.value, 0);
  // ...
};

// ✅ Good
export const GoodComponent: React.FC = () => {
  const expensiveValue = useMemo(() => {
    return data
      .filter(item => complexFilter(item))
      .map(item => complexTransform(item))
      .reduce((sum, item) => sum + item.value, 0);
  }, [data]);
  // ...
};
```

### 5. Memory Leaks

```typescript
// ❌ Bad - Will trigger critical error
export const BadComponent: React.FC = () => {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Missing cleanup
  }, []);
  // ...
};

// ✅ Good
export const GoodComponent: React.FC = () => {
  useEffect(() => {
    const handleResize = () => console.log('resized');
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  // ...
};
```

### 6. Multiple Updates

```typescript
// ❌ Bad - Will trigger warning
export const BadComponent: React.FC = () => {
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 2); // Multiple updates
    setCount(count + 3); // Multiple updates
  };
  // ...
};

// ✅ Good
export const GoodComponent: React.FC = () => {
  const handleClick = () => {
    setCount(prev => prev + 6); // Single update
  };
  // ...
};
```

## 📊 Visual Feedback

### Notification Types

1. **🚨 Error Notifications** - Merah, untuk error kritis
2. **⚠️ Warning Notifications** - Kuning, untuk peringatan
3. **📊 Info Notifications** - Biru, untuk informasi

### Screen Overlay

Untuk error kritis, sistem akan menampilkan overlay merah yang berkedip di seluruh layar selama 3 detik.

### Dashboard Features

- **Mini Status Bar** - Menampilkan jumlah error/warning
- **Expandable Dashboard** - Interface lengkap dengan tabs
- **Real-time Updates** - Update otomatis saat ada masalah baru
- **Filtering** - Filter berdasarkan tipe dan komponen
- **Statistics** - Statistik monitoring

## 🎮 Manual Testing

### Report Error

```typescript
const { reportError } = useFloxMonitor({ componentName: 'MyComponent' });

reportError({
  type: 'error', // 'warning' | 'error' | 'critical'
  message: 'Custom error message',
  details: 'Detailed error description',
  suggestions: [
    'Suggestion 1',
    'Suggestion 2'
  ]
});
```

### Report Warning

```typescript
const { reportWarning } = useFloxMonitor({ componentName: 'MyComponent' });

reportWarning({
  type: 'performance', // 'performance' | 'memory' | 'pattern'
  message: 'Custom warning message',
  details: 'Detailed warning description',
  suggestions: [
    'Suggestion 1',
    'Suggestion 2'
  ]
});
```

### Pattern Detection

```typescript
const { detectPatterns } = useFloxMonitor({ componentName: 'MyComponent' });

detectPatterns(`
  const controller = new UserController(); // Bad pattern
  const value = controller.data.value; // Direct access
`, { controller: 'UserController' });
```

## 🔧 Configuration

### Global Configuration

```typescript
import { floxMonitor } from 'flox';

// Enable/disable monitoring
floxMonitor.enable();
floxMonitor.disable();

// Get statistics
const stats = floxMonitor.getStats();
console.log(stats);
// {
//   errorCount: 5,
//   warningCount: 12,
//   currentErrors: 2,
//   currentWarnings: 3
// }

// Clear all issues
floxMonitor.clearErrors();
floxMonitor.clearWarnings();
```

### Component-specific Configuration

```typescript
const { 
  enableMonitoring, 
  disableMonitoring,
  clearErrors,
  clearWarnings 
} = useFloxMonitor({
  componentName: 'MyComponent',
  enablePatternDetection: true,
  enablePerformanceMonitoring: true,
  enableVisualFeedback: true
});
```

## 📱 Dashboard UI

### Mini Status Bar

```typescript
// Tampilan minimal saat tidak ada masalah
<div className="flox-monitor-status flox-status-clean">
  <span>✅</span>
  <span>All Good!</span>
</div>

// Tampilan saat ada masalah
<div className="flox-monitor-status">
  <span>🚨</span>
  <span>2 Errors</span>
  <span className="flox-status-count">3</span>
</div>
```

### Expanded Dashboard

Dashboard yang dapat diperluas dengan fitur:

- **Errors Tab** - Daftar semua error
- **Warnings Tab** - Daftar semua warning
- **Stats Tab** - Statistik monitoring
- **Controls** - Enable/disable monitoring, clear issues

## 🎯 Best Practices

### 1. Component Naming

```typescript
// ✅ Good - Use descriptive component names
const { reportError } = useFloxMonitor({ 
  componentName: 'UserProfileComponent' 
});

// ❌ Bad - Generic names
const { reportError } = useFloxMonitor({ 
  componentName: 'Component' 
});
```

### 2. Error Handling

```typescript
// ✅ Good - Provide helpful suggestions
reportError({
  type: 'error',
  message: 'Failed to load user data',
  details: 'Network request failed with status 500',
  suggestions: [
    'Check network connectivity',
    'Verify API endpoint',
    'Add retry mechanism'
  ]
});
```

### 3. Performance Monitoring

```typescript
// ✅ Good - Monitor expensive operations
export const ExpensiveComponent: React.FC = () => {
  useFloxPerformanceMonitor('ExpensiveComponent');
  
  const expensiveOperation = useMemo(() => {
    // Expensive computation
  }, [dependencies]);
  
  // ...
};
```

### 4. Memory Management

```typescript
// ✅ Good - Monitor memory usage
export const MemoryIntensiveComponent: React.FC = () => {
  useFloxMemoryMonitor('MemoryIntensiveComponent');
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      // Cleanup logic
    };
  }, []);
  
  // ...
};
```

## 🚨 Error Types

### Error Levels

1. **warning** - Peringatan ringan, tidak menghentikan aplikasi
2. **error** - Error yang perlu diperbaiki
3. **critical** - Error kritis, dapat menyebabkan crash

### Warning Types

1. **performance** - Masalah performa
2. **memory** - Masalah memori
3. **pattern** - Anti-pattern detection

## 📈 Statistics

Sistem monitoring menyediakan statistik real-time:

```typescript
interface FloxMonitorStats {
  errorCount: number;        // Total error sejak aplikasi dimulai
  warningCount: number;      // Total warning sejak aplikasi dimulai
  currentErrors: number;     // Error yang masih aktif
  currentWarnings: number;   // Warning yang masih aktif
}
```

## 🔄 Integration Examples

### React App Integration

```typescript
import { FloxMonitorDashboard } from 'flox';

export const App: React.FC = () => {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
      
      {/* Development only */}
      {process.env.NODE_ENV === 'development' && (
        <FloxMonitorDashboard />
      )}
    </div>
  );
};
```

### Component Integration

```typescript
import { 
  useFloxMonitor, 
  useFloxPerformanceMonitor,
  useFloxMemoryMonitor 
} from 'flox';

export const UserProfile: React.FC = () => {
  // Setup monitoring
  const { reportError } = useFloxMonitor({ 
    componentName: 'UserProfile' 
  });
  useFloxPerformanceMonitor('UserProfile');
  useFloxMemoryMonitor('UserProfile');
  
  // Component logic with error handling
  const handleLoadUser = async () => {
    try {
      const user = await api.getUser();
      setUser(user);
    } catch (error) {
      reportError({
        type: 'error',
        message: 'Failed to load user',
        details: error.message,
        suggestions: ['Check network connection', 'Verify user ID']
      });
    }
  };
  
  // ...
};
```

## 🎉 Demo

Lihat `MonitorDemo` component untuk contoh lengkap penggunaan sistem monitoring:

```typescript
import { MonitorDemo } from 'flox';

// Demo dengan berbagai test case
<MonitorDemo />
```

## 🔄 Next Steps

1. **[Testing Framework](../testing/README.md)** - Test monitoring and performance
2. **[Performance Guide](./performance.md)** - Optimize based on monitoring data
3. **[Optimization Guide](./optimization.md)** - Memory leak prevention
4. **[Best Practices](./best-practices.md)** - Follow Flox conventions

---

**🎯 Flox Monitor membantu Anda menulis kode yang lebih baik dengan feedback real-time!** 🚀 