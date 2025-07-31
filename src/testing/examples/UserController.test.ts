import { FloxTestRunner, FloxTestUtils } from '../FloxTestRunner';
import { Controller } from '../../core/Controller';
import { rxInt, rxString, rxBool, rx } from '../../core/Rx';

// Example UserController for testing
class UserController extends Controller {
  user = rx<any>(null);
  loading = rxBool(false);
  error = rxString('');
  count = rxInt(0);

  async loadUser(id: number) {
    this.loading.value = true;
    this.error.value = '';
    
    try {
      const response = await fetch(`/api/user/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const userData = await response.json();
      this.user.value = userData;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading.value = false;
    }
  }

  updateProfile(profile: any) {
    if (!profile.name || profile.name.trim() === '') {
      throw new Error('Name is required');
    }
    
    if (profile.email && !this.isValidEmail(profile.email)) {
      throw new Error('Invalid email format');
    }
    
    this.user.value = { ...this.user.value, ...profile };
  }

  increment() {
    this.count.value++;
  }

  decrement() {
    this.count.value--;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Test suite for UserController
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
      expect(controller.count.value).toBe(0);
    });

    it('should call onInit when created', () => {
      expect(controller.onInit).toHaveBeenCalled();
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
      utils.mockApiError('/api/user/999', 'User not found', { status: 404 });

      await controller.loadUser(999);

      expect(controller.user.value).toBeNull();
      expect(controller.loading.value).toBe(false);
      expect(controller.error.value).toBe('User not found');
    });

    it('should handle network errors', async () => {
      // Simulate network error by not mocking the API
      await controller.loadUser(1);

      expect(controller.user.value).toBeNull();
      expect(controller.loading.value).toBe(false);
      expect(controller.error.value).toBeTruthy();
    });

    it('should set loading state correctly', async () => {
      const mockUser = FloxTestUtils.createTestUser(1);
      utils.mockApiResponse('/api/user/1', mockUser, { delay: 100 });

      const loadPromise = controller.loadUser(1);
      
      // Check loading state immediately
      expect(controller.loading.value).toBe(true);
      expect(controller.error.value).toBe('');

      await loadPromise;

      expect(controller.loading.value).toBe(false);
    });
  });

  describe('Profile Updates', () => {
    beforeEach(() => {
      controller.user.value = FloxTestUtils.createTestUser(1);
    });

    it('should update profile successfully', () => {
      const newProfile = { name: 'Jane Doe', email: 'jane@example.com' };

      controller.updateProfile(newProfile);

      expect(controller.user.value).toEqual({
        ...FloxTestUtils.createTestUser(1),
        ...newProfile
      });
    });

    it('should validate required name field', () => {
      const invalidProfile = { name: '', email: 'test@example.com' };

      expect(() => controller.updateProfile(invalidProfile))
        .toThrow('Name is required');
    });

    it('should validate email format', () => {
      const invalidProfile = { name: 'Test User', email: 'invalid-email' };

      expect(() => controller.updateProfile(invalidProfile))
        .toThrow('Invalid email format');
    });

    it('should allow valid email format', () => {
      const validProfile = { name: 'Test User', email: 'test@example.com' };

      expect(() => controller.updateProfile(validProfile)).not.toThrow();
    });
  });

  describe('Counter Operations', () => {
    it('should increment counter', () => {
      const initialCount = controller.count.value;
      
      controller.increment();
      
      expect(controller.count.value).toBe(initialCount + 1);
    });

    it('should decrement counter', () => {
      controller.count.value = 5;
      
      controller.decrement();
      
      expect(controller.count.value).toBe(4);
    });

    it('should handle multiple operations', () => {
      controller.increment();
      controller.increment();
      controller.decrement();
      controller.increment();
      
      expect(controller.count.value).toBe(2);
    });
  });

  describe('Rx Variable Behavior', () => {
    it('should notify subscribers on value change', async () => {
      const spy = jest.fn();
      controller.user.subscribe(spy);

      const mockUser = FloxTestUtils.createTestUser(1);
      controller.user.value = mockUser;

      await FloxTestUtils.waitFor(() => spy.mock.calls.length > 0);
      expect(spy).toHaveBeenCalledWith(mockUser);
    });

    it('should handle multiple subscribers', async () => {
      const spy1 = jest.fn();
      const spy2 = jest.fn();
      
      controller.count.subscribe(spy1);
      controller.count.subscribe(spy2);

      controller.increment();

      await FloxTestUtils.waitFor(() => spy1.mock.calls.length > 0 && spy2.mock.calls.length > 0);
      expect(spy1).toHaveBeenCalledWith(1);
      expect(spy2).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when starting new operation', async () => {
      controller.error.value = 'Previous error';
      
      const mockUser = FloxTestUtils.createTestUser(1);
      utils.mockApiResponse('/api/user/1', mockUser);

      await controller.loadUser(1);

      expect(controller.error.value).toBe('');
    });

    it('should preserve user data on error', async () => {
      const existingUser = FloxTestUtils.createTestUser(1);
      controller.user.value = existingUser;

      utils.mockApiError('/api/user/2', 'User not found');

      await controller.loadUser(2);

      expect(controller.user.value).toEqual(existingUser);
      expect(controller.error.value).toBe('User not found');
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid state updates efficiently', async () => {
      const result = await FloxTestRunner.testPerformance(async () => {
        for (let i = 0; i < 100; i++) {
          controller.count.value = i;
        }
      }, {
        maxDuration: 10, // 10ms max
        iterations: 10
      });

      expect(result.success).toBe(true);
    });

    it('should not cause memory leaks on repeated operations', async () => {
      const result = await FloxTestRunner.testMemoryLeaks(async () => {
        for (let i = 0; i < 50; i++) {
          controller.increment();
          controller.decrement();
        }
      }, {
        maxMemoryLeak: 1024 * 1024, // 1MB
        iterations: 10
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Integration with TestRunner', () => {
    it('should work with FloxTestRunner.testController', async () => {
      const result = await FloxTestRunner.testController(
        UserController,
        async (controller, utils) => {
          const mockUser = FloxTestUtils.createTestUser(1);
          utils.mockApiResponse('/api/user/1', mockUser);

          await controller.loadUser(1);
          
          expect(controller.user.value).toEqual(mockUser);
          expect(controller.loading.value).toBe(false);
          expect(controller.error.value).toBe('');
        },
        { testName: 'UserController Integration Test' }
      );

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});

// Example of running tests programmatically
export async function runUserControllerTests() {
  console.log('🧪 Running UserController Tests...\n');

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
  
  return results;
} 