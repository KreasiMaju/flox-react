# 🧪 Flox Testing Framework

Framework testing yang powerful dan mudah digunakan untuk Flox state management.

## 🎯 Overview

Flox Testing Framework menyediakan tools lengkap untuk testing:
- **Unit Testing** - Testing individual controllers dan Rx variables
- **Integration Testing** - Testing binding dan component interactions
- **Performance Testing** - Testing performa dan memory usage
- **Memory Leak Testing** - Deteksi memory leaks
- **Mock API** - Mock API responses dan errors
- **Test Utilities** - Helper functions untuk testing

## 🚀 Quick Start

### Installation

```bash
# Testing framework sudah included dalam Flox
import { 
  FloxTestUtils, 
  FloxTestRunner 
} from 'flox';
```

### Basic Controller Test

```typescript
import { FloxTestRunner, FloxTestUtils } from 'flox';

describe('UserController', () => {
  let controller: UserController;
  let utils: FloxTestUtils;

  beforeEach(() => {
    utils = new FloxTestUtils();
    utils.setupTestEnvironment();
    controller = FloxTestUtils.createMockController(UserController);
  });

  afterEach(() => {
    utils.cleanupTestEnvironment();
  });

  it('should load user data successfully', async () => {
    const mockUser = FloxTestUtils.createTestUser(1);
    utils.mockApiResponse('/api/user/1', mockUser);

    await controller.loadUser(1);

    expect(controller.user.value).toEqual(mockUser);
    expect(controller.loading.value).toBe(false);
    expect(controller.error.value).toBe('');
  });
});
```

## 🔧 Core Components

### FloxTestUtils

Utility class untuk testing setup dan mocking.

#### Setup Test Environment

```typescript
const utils = new FloxTestUtils();
utils.setupTestEnvironment(); // Setup mocks
// ... run tests ...
utils.cleanupTestEnvironment(); // Cleanup
```

#### Mock API Responses

```typescript
// Mock successful response
utils.mockApiResponse('/api/user/1', { 
  id: 1, 
  name: 'John Doe' 
});

// Mock error response
utils.mockApiError('/api/user/999', 'User not found', { 
  status: 404 
});

// Mock with delay
utils.mockApiResponse('/api/slow', data, { delay: 1000 });
```

#### Create Test Data

```typescript
// Create test user
const user = FloxTestUtils.createTestUser(1);
// { id: 1, name: 'Test User 1', email: 'user1@test.com', ... }

// Create multiple test users
const users = FloxTestUtils.createTestUsers(5);
// Array of 5 test users
```

#### Wait for Async Operations

```typescript
// Wait for condition
await FloxTestUtils.waitFor(() => controller.loading.value === false);

// Wait for Rx value
await FloxTestUtils.waitForRxValue(controller.user, expectedUser);

// Wait for Rx change
const newValue = await FloxTestUtils.waitForRxChange(controller.count);
```

### FloxTestRunner

Test execution engine dengan berbagai jenis testing.

#### Controller Testing

```typescript
const result = await FloxTestRunner.testController(
  UserController,
  async (controller, utils) => {
    const mockUser = FloxTestUtils.createTestUser(1);
    utils.mockApiResponse('/api/user/1', mockUser);
    
    await controller.loadUser(1);
    
    expect(controller.user.value).toEqual(mockUser);
    expect(controller.loading.value).toBe(false);
  }
);

expect(result.success).toBe(true);
```

#### Integration Testing

```typescript
const result = await FloxTestRunner.testIntegration(
  AuthBinding,
  async (binding, utils) => {
    utils.mockApiResponse('/api/login', { token: 'abc123' });
    utils.mockApiResponse('/api/user/profile', userData);
    
    await binding.login('user@example.com', 'password');
    
    expect(binding.authController.isAuthenticated.value).toBe(true);
    expect(binding.userController.user.value).toEqual(userData);
  }
);
```

#### Performance Testing

```typescript
const result = await FloxTestRunner.testPerformance(
  async () => {
    for (let i = 0; i < 1000; i++) {
      controller.count.value = i;
    }
  },
  {
    maxDuration: 100, // 100ms max
    maxMemoryIncrease: 1024 * 1024, // 1MB max
    iterations: 10
  }
);
```

#### Memory Leak Testing

```typescript
const result = await FloxTestRunner.testMemoryLeaks(
  async () => {
    const controller = new TestController();
    controller.onInit();
    // ... perform operations ...
    controller.onDispose();
  },
  {
    maxMemoryLeak: 1024 * 1024, // 1MB max
    iterations: 50,
    forceGC: true
  }
);
```

## 📝 Test Examples

### Controller Testing

```typescript
describe('UserController', () => {
  let controller: UserController;
  let utils: FloxTestUtils;

  beforeEach(() => {
    utils = new FloxTestUtils();
    utils.setupTestEnvironment();
    controller = FloxTestUtils.createMockController(UserController);
  });

  afterEach(() => {
    utils.cleanupTestEnvironment();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(controller.user.value).toBeNull();
      expect(controller.loading.value).toBe(false);
      expect(controller.error.value).toBe('');
    });
  });

  describe('User Loading', () => {
    it('should load user data successfully', async () => {
      const mockUser = FloxTestUtils.createTestUser(1);
      utils.mockApiResponse('/api/user/1', mockUser);

      await controller.loadUser(1);

      expect(controller.user.value).toEqual(mockUser);
      expect(controller.loading.value).toBe(false);
      expect(controller.error.value).toBe('');
    });

    it('should handle API errors', async () => {
      utils.mockApiError('/api/user/999', 'User not found');

      await controller.loadUser(999);

      expect(controller.user.value).toBeNull();
      expect(controller.loading.value).toBe(false);
      expect(controller.error.value).toBe('User not found');
    });
  });

  describe('Profile Updates', () => {
    it('should update profile successfully', () => {
      const newProfile = { name: 'Jane Doe', email: 'jane@example.com' };
      
      controller.updateProfile(newProfile);
      
      expect(controller.user.value).toEqual(newProfile);
    });

    it('should validate required fields', () => {
      expect(() => controller.updateProfile({ name: '' }))
        .toThrow('Name is required');
    });
  });
});
```

### Rx Variable Testing

```typescript
describe('Rx Variables', () => {
  it('should update values correctly', () => {
    const count = rxInt(0);
    const name = rxString('');
    
    count.value = 5;
    name.value = 'John Doe';
    
    expect(count.value).toBe(5);
    expect(name.value).toBe('John Doe');
  });

  it('should notify subscribers on value change', async () => {
    const count = rxInt(0);
    const spy = jest.fn();
    
    count.subscribe(spy);
    count.value = 10;
    
    await FloxTestUtils.waitFor(() => spy.mock.calls.length > 0);
    expect(spy).toHaveBeenCalledWith(10);
  });

  it('should compute derived values', () => {
    const price = rxInt(100);
    const quantity = rxInt(2);
    const total = price.map(p => p * quantity.value);
    
    expect(total.value).toBe(200);
    
    quantity.value = 3;
    expect(total.value).toBe(300);
  });
});
```

### Integration Testing

```typescript
describe('AuthBinding Integration', () => {
  let binding: AuthBinding;
  let utils: FloxTestUtils;

  beforeEach(() => {
    utils = new FloxTestUtils();
    utils.setupTestEnvironment();
    binding = FloxTestUtils.createMockBinding(AuthBinding);
  });

  afterEach(() => {
    utils.cleanupTestEnvironment();
  });

  it('should handle complete login flow', async () => {
    utils.mockApiResponse('/api/login', { token: 'abc123' });
    utils.mockApiResponse('/api/user/profile', userData);
    
    await binding.login('user@example.com', 'password');
    
    expect(binding.authController.isAuthenticated.value).toBe(true);
    expect(binding.userController.user.value).toEqual(userData);
    expect(binding.authController.token.value).toBe('abc123');
  });

  it('should handle logout flow', async () => {
    binding.authController.isAuthenticated.value = true;
    binding.userController.user.value = userData;
    
    await binding.logout();
    
    expect(binding.authController.isAuthenticated.value).toBe(false);
    expect(binding.userController.user.value).toBeNull();
  });
});
```

## ⚡ Performance Testing

### Render Performance

```typescript
describe('Performance Tests', () => {
  it('should render within 16ms (60fps)', () => {
    const renderTime = FloxTestUtils.measureExecutionTime(() => {
      render(<ComplexComponent data={largeDataset} />);
    });
    
    expect(renderTime.time).toBeLessThan(16);
  });

  it('should handle large data sets efficiently', () => {
    const largeDataset = generateLargeDataset(10000);
    
    const { memoryBefore, memoryAfter } = FloxTestUtils.measureMemoryUsage(() => {
      render(<DataTable data={largeDataset} />);
    });
    
    const memoryIncrease = memoryAfter - memoryBefore;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

### State Update Performance

```typescript
it('should handle rapid state updates efficiently', async () => {
  const result = await FloxTestRunner.testPerformance(async () => {
    for (let i = 0; i < 1000; i++) {
      controller.count.value = i;
    }
  }, {
    maxDuration: 100, // 100ms max
    iterations: 10
  });

  expect(result.success).toBe(true);
});
```

## 🧠 Memory Leak Testing

### Controller Memory Leaks

```typescript
it('should not leak memory on controller disposal', async () => {
  const result = await FloxTestRunner.testMemoryLeaks(async () => {
    const controller = new TestController();
    controller.onInit();
    // ... perform operations ...
    controller.onDispose();
  }, {
    maxMemoryLeak: 1024 * 1024, // 1MB
    iterations: 50,
    forceGC: true
  });

  expect(result.success).toBe(true);
});
```

### Subscription Memory Leaks

```typescript
it('should clean up subscriptions properly', async () => {
  const result = await FloxTestRunner.testMemoryLeaks(async () => {
    const count = rxInt(0);
    const subscriptions: (() => void)[] = [];
    
    // Create many subscriptions
    for (let i = 0; i < 100; i++) {
      const subscription = count.subscribe(() => {});
      subscriptions.push(subscription);
    }
    
    // Update value
    count.value = 1;
    
    // Cleanup subscriptions
    subscriptions.forEach(unsubscribe => unsubscribe());
  });

  expect(result.success).toBe(true);
});
```

## 🎮 Test Suites

### Running Test Suites

```typescript
const testSuite = {
  name: 'UserController Test Suite',
  tests: [
    async () => {
      const result = await FloxTestRunner.testController(
        UserController,
        async (controller, utils) => {
          const mockUser = FloxTestUtils.createTestUser(1);
          utils.mockApiResponse('/api/user/1', mockUser);
          await controller.loadUser(1);
          expect(controller.user.value).toEqual(mockUser);
        }
      );
      if (!result.success) throw new Error(result.error?.message);
    },
    async () => {
      const result = await FloxTestRunner.testController(
        UserController,
        async (controller) => {
          controller.increment();
          controller.increment();
          expect(controller.count.value).toBe(2);
        }
      );
      if (!result.success) throw new Error(result.error?.message);
    }
  ]
};

const runner = new FloxTestRunner();
const results = await runner.runTestSuite(testSuite);
console.log(runner.generateReport());
```

### Test Reports

```typescript
// Generate test report
const report = runner.generateReport();
console.log(report);

// Get test summary
const summary = runner.getSummary();
console.log(`Tests: ${summary.passed}/${summary.total} passed`);
console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(2)}%`);
console.log(`Total Duration: ${summary.totalDuration.toFixed(2)}ms`);
```

## 🔧 Advanced Features

### Custom Test Utilities

```typescript
// Custom test data generator
class CustomTestUtils extends FloxTestUtils {
  static createTestProduct(id: number = 1) {
    return {
      id,
      name: `Product ${id}`,
      price: Math.random() * 100,
      category: ['Electronics', 'Clothing', 'Books'][Math.floor(Math.random() * 3)],
      inStock: Math.random() > 0.5
    };
  }

  static createTestOrder(id: number = 1) {
    return {
      id,
      userId: Math.floor(Math.random() * 100) + 1,
      products: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => 
        this.createTestProduct(i + 1)
      ),
      total: 0,
      status: 'pending'
    };
  }
}
```

### Mock Complex APIs

```typescript
// Mock complex API with different responses
utils.mockApiResponse('/api/search', (url: string) => {
  const params = new URLSearchParams(url.split('?')[1]);
  const query = params.get('q');
  const page = parseInt(params.get('page') || '1');
  
  return {
    results: Array.from({ length: 10 }, (_, i) => ({
      id: (page - 1) * 10 + i + 1,
      name: `Result ${i + 1} for "${query}"`,
      relevance: Math.random()
    })),
    total: 100,
    page,
    hasMore: page < 10
  };
});
```

## 📊 Best Practices

### 1. **Test Organization**
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. **Mock Management**
- Always cleanup test environment
- Use specific mock responses
- Test both success and error scenarios

### 3. **Performance Testing**
- Set realistic performance thresholds
- Test with realistic data sizes
- Monitor memory usage

### 4. **Memory Leak Testing**
- Test controller lifecycle
- Verify subscription cleanup
- Use garbage collection when available

### 5. **Async Testing**
- Use `waitFor` utilities
- Handle promises properly
- Test loading states

## 🔄 Next Steps

1. **[Controller Testing](./controller-testing.md)** - Advanced controller testing patterns
2. **[Integration Testing](./integration-testing.md)** - Complex integration scenarios
3. **[Performance Testing](./performance-testing.md)** - Performance optimization testing
4. **[Memory Testing](./memory-testing.md)** - Memory leak detection strategies

---

**🎉 Your Flox app is now fully testable!** 🚀 