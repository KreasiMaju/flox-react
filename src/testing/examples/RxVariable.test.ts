import { FloxTestRunner, FloxTestUtils } from '../FloxTestRunner';
import { rx, rxInt, rxString, rxBool, Rx } from '../../core/Rx';

describe('Rx Variables', () => {
  describe('Basic Operations', () => {
    it('should create Rx variables with initial values', () => {
      const count = rxInt(0);
      const name = rxString('');
      const active = rxBool(false);
      const data = rx<any[]>([]);

      expect(count.value).toBe(0);
      expect(name.value).toBe('');
      expect(active.value).toBe(false);
      expect(data.value).toEqual([]);
    });

    it('should update values correctly', () => {
      const count = rxInt(0);
      const name = rxString('');
      const active = rxBool(false);

      count.value = 5;
      name.value = 'John Doe';
      active.value = true;

      expect(count.value).toBe(5);
      expect(name.value).toBe('John Doe');
      expect(active.value).toBe(true);
    });

    it('should handle type-specific operations', () => {
      const count = rxInt(0);
      const name = rxString('Hello');
      const active = rxBool(false);

      // Integer operations
      count.value++;
      expect(count.value).toBe(1);
      count.value += 5;
      expect(count.value).toBe(6);

      // String operations
      name.value += ' World';
      expect(name.value).toBe('Hello World');

      // Boolean operations
      active.value = !active.value;
      expect(active.value).toBe(true);
    });
  });

  describe('Subscription and Notifications', () => {
    it('should notify subscribers on value change', async () => {
      const count = rxInt(0);
      const spy = jest.fn();

      count.subscribe(spy);
      count.value = 10;

      await FloxTestUtils.waitFor(() => spy.mock.calls.length > 0);
      expect(spy).toHaveBeenCalledWith(10);
    });

    it('should handle multiple subscribers', async () => {
      const count = rxInt(0);
      const spy1 = jest.fn();
      const spy2 = jest.fn();

      count.subscribe(spy1);
      count.subscribe(spy2);

      count.value = 5;

      await FloxTestUtils.waitFor(() => spy1.mock.calls.length > 0 && spy2.mock.calls.length > 0);
      expect(spy1).toHaveBeenCalledWith(5);
      expect(spy2).toHaveBeenCalledWith(5);
    });

    it('should unsubscribe correctly', async () => {
      const count = rxInt(0);
      const spy = jest.fn();

      const unsubscribe = count.subscribe(spy);
      count.value = 1;

      await FloxTestUtils.waitFor(() => spy.mock.calls.length > 0);
      expect(spy).toHaveBeenCalledWith(1);

      unsubscribe();
      count.value = 2;

      // Wait a bit to ensure no additional calls
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(spy).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should not notify when value is the same', async () => {
      const count = rxInt(5);
      const spy = jest.fn();

      count.subscribe(spy);
      count.value = 5; // Same value

      // Wait a bit to ensure no calls
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Computed Values', () => {
    it('should compute derived values', () => {
      const price = rxInt(100);
      const quantity = rxInt(2);
      const total = price.map(p => p * quantity.value);

      expect(total.value).toBe(200);

      quantity.value = 3;
      expect(total.value).toBe(300);
    });

    it('should handle complex computations', () => {
      const items = rx<Array<{ id: number; price: number; quantity: number }>>([
        { id: 1, price: 10, quantity: 2 },
        { id: 2, price: 20, quantity: 1 },
        { id: 3, price: 15, quantity: 3 }
      ]);

      const totalValue = items.map(items => 
        items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      );

      expect(totalValue.value).toBe(75); // 10*2 + 20*1 + 15*3 = 75

      // Update an item
      items.value = items.value.map(item => 
        item.id === 1 ? { ...item, quantity: 3 } : item
      );

      expect(totalValue.value).toBe(85); // 10*3 + 20*1 + 15*3 = 85
    });

    it('should handle nested computations', () => {
      const basePrice = rxInt(100);
      const discount = rxInt(10);
      const tax = rxInt(5);

      const finalPrice = basePrice
        .map(price => price - discount.value)
        .map(price => price + (price * tax.value / 100));

      expect(finalPrice.value).toBe(94.5); // (100 - 10) + (90 * 0.05) = 94.5

      discount.value = 20;
      expect(finalPrice.value).toBe(84); // (100 - 20) + (80 * 0.05) = 84
    });
  });

  describe('Filtering and Transformation', () => {
    it('should filter values correctly', () => {
      const numbers = rx<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const evenNumbers = numbers.where(n => n % 2 === 0);
      const oddNumbers = numbers.where(n => n % 2 === 1);

      expect(evenNumbers.value).toEqual([2, 4, 6, 8, 10]);
      expect(oddNumbers.value).toEqual([1, 3, 5, 7, 9]);
    });

    it('should transform values correctly', () => {
      const names = rx<string[]>(['john', 'jane', 'bob']);
      const capitalizedNames = names.map(names => 
        names.map(name => name.charAt(0).toUpperCase() + name.slice(1))
      );

      expect(capitalizedNames.value).toEqual(['John', 'Jane', 'Bob']);
    });

    it('should chain operations', () => {
      const numbers = rx<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const result = numbers
        .where(n => n % 2 === 0) // Even numbers
        .map(numbers => numbers.map(n => n * 2)) // Double them
        .map(numbers => numbers.filter(n => n > 10)); // Filter > 10

      expect(result.value).toEqual([12, 16, 20]);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in computations gracefully', () => {
      const data = rx<number[]>([1, 2, 3, 4, 5]);
      
      const safeComputation = data.map(numbers => {
        try {
          return numbers.map(n => {
            if (n === 3) throw new Error('Invalid number');
            return n * 2;
          });
        } catch (error) {
          return numbers.map(n => n * 2).filter(n => n !== 6);
        }
      });

      expect(safeComputation.value).toEqual([2, 4, 8, 10]);
    });

    it('should handle null/undefined values', () => {
      const data = rx<any[]>([1, null, 3, undefined, 5]);
      
      const validData = data.map(items => 
        items.filter(item => item != null)
      );

      expect(validData.value).toEqual([1, 3, 5]);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => i);
      const data = rx<number[]>(largeDataset);

      const result = await FloxTestRunner.testPerformance(() => {
        const filtered = data.where(n => n % 2 === 0);
        const transformed = filtered.map(numbers => numbers.map(n => n * 2));
        return transformed.value;
      }, {
        maxDuration: 50, // 50ms max
        iterations: 10
      });

      expect(result.success).toBe(true);
    });

    it('should handle rapid updates efficiently', async () => {
      const count = rxInt(0);

      const result = await FloxTestRunner.testPerformance(() => {
        for (let i = 0; i < 1000; i++) {
          count.value = i;
        }
      }, {
        maxDuration: 100, // 100ms max
        iterations: 5
      });

      expect(result.success).toBe(true);
    });

    it('should not cause memory leaks with subscriptions', async () => {
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
      }, {
        maxMemoryLeak: 1024 * 1024, // 1MB
        iterations: 10
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complex state management', async () => {
      const result = await FloxTestRunner.testController(
        class TestController {
          count = rxInt(0);
          name = rxString('');
          items = rx<any[]>([]);

          addItem(item: any) {
            this.items.value = [...this.items.value, item];
          }

          removeItem(id: string) {
            this.items.value = this.items.value.filter(item => item.id !== id);
          }

          get itemCount() {
            return this.items.map(items => items.length);
          }

          get totalValue() {
            return this.items.map(items => 
              items.reduce((sum, item) => sum + (item.price || 0), 0)
            );
          }
        },
        async (controller) => {
          // Test initial state
          expect(controller.itemCount.value).toBe(0);
          expect(controller.totalValue.value).toBe(0);

          // Add items
          controller.addItem({ id: '1', price: 10 });
          controller.addItem({ id: '2', price: 20 });
          controller.addItem({ id: '3', price: 30 });

          expect(controller.itemCount.value).toBe(3);
          expect(controller.totalValue.value).toBe(60);

          // Remove item
          controller.removeItem('2');

          expect(controller.itemCount.value).toBe(2);
          expect(controller.totalValue.value).toBe(40);
        }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references', () => {
      const data = rx<any>({});
      data.value = { self: data };

      // Should not cause infinite recursion
      expect(data.value).toBeDefined();
    });

    it('should handle deep nesting', () => {
      const data = rx<number>(1);
      
      let deeplyNested = data;
      for (let i = 0; i < 10; i++) {
        deeplyNested = deeplyNested.map(val => val * 2);
      }

      expect(deeplyNested.value).toBe(1024); // 1 * 2^10
    });

    it('should handle async operations in computations', async () => {
      const data = rx<number>(1);
      
      const asyncComputation = data.map(async (val) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return val * 2;
      });

      // Note: This is a simplified test - in practice, you'd need to handle async computations differently
      expect(asyncComputation.value).toBeInstanceOf(Promise);
    });
  });
});

// Example of running Rx tests programmatically
export async function runRxVariableTests() {
  console.log('🧪 Running Rx Variable Tests...\n');

  const testSuite = {
    name: 'Rx Variable Test Suite',
    tests: [
      async () => {
        const count = rxInt(0);
        count.value = 5;
        expect(count.value).toBe(5);
      },
      async () => {
        const count = rxInt(0);
        const spy = jest.fn();
        count.subscribe(spy);
        count.value = 10;
        await FloxTestUtils.waitFor(() => spy.mock.calls.length > 0);
        expect(spy).toHaveBeenCalledWith(10);
      },
      async () => {
        const price = rxInt(100);
        const quantity = rxInt(2);
        const total = price.map(p => p * quantity.value);
        expect(total.value).toBe(200);
      }
    ]
  };

  const runner = new FloxTestRunner();
  const results = await runner.runTestSuite(testSuite);
  
  console.log(runner.generateReport());
  
  return results;
} 