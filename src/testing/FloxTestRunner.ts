import { Controller } from '../core/Controller';
import { Binding } from '../core/Binding';
import { FloxTestUtils } from './FloxTestUtils';

export interface TestResult {
  success: boolean;
  duration: number;
  error?: Error;
  testName: string;
  testType: 'unit' | 'integration' | 'performance' | 'memory';
}

export interface PerformanceTestOptions {
  maxDuration?: number; // Maximum allowed duration in ms
  maxMemoryIncrease?: number; // Maximum memory increase in bytes
  iterations?: number; // Number of iterations to run
  warmupIterations?: number; // Number of warmup iterations
}

export interface MemoryTestOptions {
  maxMemoryLeak?: number; // Maximum memory leak in bytes
  iterations?: number; // Number of iterations to run
  forceGC?: boolean; // Force garbage collection between iterations
}

export interface TestSuite {
  name: string;
  tests: TestFunction[];
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
}

export type TestFunction = () => void | Promise<void>;

export class FloxTestRunner {
  private results: TestResult[] = [];
  private isRunning = false;

  /**
   * Run controller tests
   */
  static async testController<T extends Controller>(
    controllerClass: new () => T,
    testSuite: (controller: T, utils: FloxTestUtils) => void | Promise<void>,
    options: { testName?: string } = {}
  ): Promise<TestResult> {
    const testName = options.testName || controllerClass.name;
    const startTime = performance.now();
    
    try {
      const utils = new FloxTestUtils();
      utils.setupTestEnvironment();
      
      const controller = FloxTestUtils.createMockController(controllerClass);
      
      // Run test suite
      await testSuite(controller, utils);
      
      // Cleanup
      if (controller.onDispose) {
        controller.onDispose();
      }
      utils.cleanupTestEnvironment();
      
      const duration = performance.now() - startTime;
      
      return {
        success: true,
        duration,
        testName,
        testType: 'unit'
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        success: false,
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
        testName,
        testType: 'unit'
      };
    }
  }

  /**
   * Run integration tests
   */
  static async testIntegration(
    bindingClass: new () => Binding,
    testSuite: (binding: Binding, utils: FloxTestUtils) => void | Promise<void>,
    options: { testName?: string } = {}
  ): Promise<TestResult> {
    const testName = options.testName || bindingClass.name;
    const startTime = performance.now();
    
    try {
      const utils = new FloxTestUtils();
      utils.setupTestEnvironment();
      
      const binding = FloxTestUtils.createMockBinding(bindingClass);
      
      // Run test suite
      await testSuite(binding, utils);
      
      // Cleanup
      utils.cleanupTestEnvironment();
      
      const duration = performance.now() - startTime;
      
      return {
        success: true,
        duration,
        testName,
        testType: 'integration'
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        success: false,
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
        testName,
        testType: 'integration'
      };
    }
  }

  /**
   * Run performance tests
   */
  static async testPerformance(
    testFunction: () => void | Promise<void>,
    options: PerformanceTestOptions = {}
  ): Promise<TestResult> {
    const {
      maxDuration = 100,
      maxMemoryIncrease = 1024 * 1024, // 1MB
      iterations = 100,
      warmupIterations = 10
    } = options;
    
    const startTime = performance.now();
    
    try {
      // Warmup iterations
      for (let i = 0; i < warmupIterations; i++) {
        await testFunction();
      }
      
      // Measure memory before
      const memoryBefore = FloxTestUtils.getMemoryUsage();
      
      // Run performance test
      const executionTimes: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const iterationStart = performance.now();
        await testFunction();
        const iterationEnd = performance.now();
        executionTimes.push(iterationEnd - iterationStart);
      }
      
      // Measure memory after
      const memoryAfter = FloxTestUtils.getMemoryUsage();
      const memoryIncrease = memoryAfter - memoryBefore;
      
      // Calculate statistics
      const avgDuration = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const maxDurationObserved = Math.max(...executionTimes);
      const minDurationObserved = Math.min(...executionTimes);
      
      const duration = performance.now() - startTime;
      
      // Check performance constraints
      if (avgDuration > maxDuration) {
        throw new Error(
          `Performance test failed: Average duration ${avgDuration.toFixed(2)}ms exceeds maximum ${maxDuration}ms`
        );
      }
      
      if (memoryIncrease > maxMemoryIncrease) {
        throw new Error(
          `Performance test failed: Memory increase ${memoryIncrease} bytes exceeds maximum ${maxMemoryIncrease} bytes`
        );
      }
      
      return {
        success: true,
        duration,
        testName: 'Performance Test',
        testType: 'performance'
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        success: false,
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
        testName: 'Performance Test',
        testType: 'performance'
      };
    }
  }

  /**
   * Run memory leak tests
   */
  static async testMemoryLeaks(
    testFunction: () => void | Promise<void>,
    options: MemoryTestOptions = {}
  ): Promise<TestResult> {
    const {
      maxMemoryLeak = 1024 * 1024, // 1MB
      iterations = 50,
      forceGC = true
    } = options;
    
    const startTime = performance.now();
    
    try {
      const memorySnapshots: number[] = [];
      
      // Run test multiple times and measure memory
      for (let i = 0; i < iterations; i++) {
        if (forceGC) {
          FloxTestUtils.forceGarbageCollection();
        }
        
        const memoryBefore = FloxTestUtils.getMemoryUsage();
        await testFunction();
        const memoryAfter = FloxTestUtils.getMemoryUsage();
        
        memorySnapshots.push(memoryAfter - memoryBefore);
      }
      
      // Calculate memory growth
      const totalMemoryGrowth = memorySnapshots.reduce((a, b) => a + b, 0);
      const averageMemoryGrowth = totalMemoryGrowth / memorySnapshots.length;
      
      const duration = performance.now() - startTime;
      
      // Check for memory leaks
      if (totalMemoryGrowth > maxMemoryLeak) {
        throw new Error(
          `Memory leak detected: Total memory growth ${totalMemoryGrowth} bytes exceeds maximum ${maxMemoryLeak} bytes`
        );
      }
      
      return {
        success: true,
        duration,
        testName: 'Memory Leak Test',
        testType: 'memory'
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        success: false,
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
        testName: 'Memory Leak Test',
        testType: 'memory'
      };
    }
  }

  /**
   * Run a test suite
   */
  async runTestSuite(suite: TestSuite): Promise<TestResult[]> {
    if (this.isRunning) {
      throw new Error('Test runner is already running');
    }
    
    this.isRunning = true;
    this.results = [];
    
    try {
      // Setup
      if (suite.setup) {
        await suite.setup();
      }
      
      // Run tests
      for (const test of suite.tests) {
        const startTime = performance.now();
        
        try {
          await test();
          
          const duration = performance.now() - startTime;
          this.results.push({
            success: true,
            duration,
            testName: suite.name,
            testType: 'unit'
          });
        } catch (error) {
          const duration = performance.now() - startTime;
          this.results.push({
            success: false,
            duration,
            error: error instanceof Error ? error : new Error(String(error)),
            testName: suite.name,
            testType: 'unit'
          });
        }
      }
      
      // Teardown
      if (suite.teardown) {
        await suite.teardown();
      }
      
      return this.results;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Get test summary
   */
  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    totalDuration: number;
    averageDuration: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = total > 0 ? totalDuration / total : 0;
    
    return {
      total,
      passed,
      failed,
      totalDuration,
      averageDuration
    };
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const summary = this.getSummary();
    const results = this.getResults();
    
    let report = `# Flox Test Report\n\n`;
    report += `## Summary\n`;
    report += `- Total Tests: ${summary.total}\n`;
    report += `- Passed: ${summary.passed}\n`;
    report += `- Failed: ${summary.failed}\n`;
    report += `- Success Rate: ${((summary.passed / summary.total) * 100).toFixed(2)}%\n`;
    report += `- Total Duration: ${summary.totalDuration.toFixed(2)}ms\n`;
    report += `- Average Duration: ${summary.averageDuration.toFixed(2)}ms\n\n`;
    
    report += `## Test Results\n\n`;
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      report += `### ${index + 1}. ${result.testName}\n`;
      report += `- Status: ${status}\n`;
      report += `- Type: ${result.testType}\n`;
      report += `- Duration: ${result.duration.toFixed(2)}ms\n`;
      
      if (result.error) {
        report += `- Error: ${result.error.message}\n`;
      }
      
      report += `\n`;
    });
    
    return report;
  }
}

// Export singleton instance
export const floxTestRunner = new FloxTestRunner(); 