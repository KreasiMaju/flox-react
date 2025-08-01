import React, { useState } from 'react';
import { FloxTestRunner } from '../testing/FloxTestRunner';


import { Controller } from '../core/Controller';
import { rxInt, rxString, rxBool } from '../core/Rx';

// Example controller for testing demo
class TestController extends Controller {
  count = rxInt(0);
  name = rxString('');
  loading = rxBool(false);
  error = rxString('');

  increment() {
    this.count.value++;
  }

  setName(name: string) {
    this.name.value = name;
  }

  async loadData() {
    this.loading.value = true;
    this.error.value = '';
    
    try {
      const response = await fetch('/api/test-data');
      const data = await response.json();
      this.name.value = data.name;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading.value = false;
    }
  }
}

export const TestingDemo: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState('');

  const runBasicTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setReport('');

    const results: any[] = [];

    try {
      // Test 1: Basic controller test
      const result1 = await FloxTestRunner.testController(
        TestController,
        async (controller) => {
          controller.increment();
          controller.increment();
          if (controller.count.value !== 2) {
            throw new Error('Expected count to be 2');
          }
        },
        { testName: 'Basic Controller Test' }
      );
      results.push(result1);

      // Test 2: API test
      const result2 = await FloxTestRunner.testController(
        TestController,
        async (controller) => {
          await controller.loadData();
          
          if (controller.name.value !== 'Test User') {
            throw new Error('Expected name to be Test User');
          }
          if (controller.loading.value !== false) {
            throw new Error('Expected loading to be false');
          }
          if (controller.error.value !== '') {
            throw new Error('Expected error to be empty');
          }
        },
        { testName: 'API Integration Test' }
      );
      results.push(result2);

      // Test 3: Error handling test
      const result3 = await FloxTestRunner.testController(
        TestController,
        async (controller) => {
          await controller.loadData();
          
          if (controller.error.value !== 'Network error') {
            throw new Error('Expected error to be Network error');
          }
          if (controller.loading.value !== false) {
            throw new Error('Expected loading to be false');
          }
        },
        { testName: 'Error Handling Test' }
      );
      results.push(result3);

      // Test 4: Performance test
      const result4 = await FloxTestRunner.testPerformance(
        async () => {
          const controller = new TestController();
          for (let i = 0; i < 1000; i++) {
            controller.increment();
          }
        },
        {
          maxDuration: 10,
          iterations: 5
        }
      );
      results.push(result4);

      // Test 5: Memory leak test
      const result5 = await FloxTestRunner.testMemoryLeaks(
        async () => {
          const controller = new TestController();
          for (let i = 0; i < 100; i++) {
            controller.increment();
          }
        },
        {
          maxMemoryLeak: 1024 * 1024,
          iterations: 10
        }
      );
      results.push(result5);

      setTestResults(results);

      // Generate report
      const runner = new FloxTestRunner();
      runner['results'] = results;
      const testReport = runner.generateReport();
      setReport(testReport);

    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runRxTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setReport('');

    const results: any[] = [];

    try {
      // Test Rx variable operations
      const result1 = await FloxTestRunner.testPerformance(
        () => {
          // Rx variable testing
          const count = rxInt(0);
          const name = rxString('');
          const active = rxBool(false);

          for (let i = 0; i < 100; i++) {
            count.value = i;
            name.value = `User ${i}`;
            active.value = i % 2 === 0;
          }
        },
        { maxDuration: 50, iterations: 5 }
      );
      results.push({ ...result1, testName: 'Rx Variable Operations' });

      // Test Rx subscriptions
      const result2 = await FloxTestRunner.testMemoryLeaks(
        async () => {
          // Memory leak testing
          const count = rxInt(0);
          const subscriptions: (() => void)[] = [];

          // Create many subscriptions
          for (let i = 0; i < 50; i++) {
            const subscription = count.subscribe(() => {});
            subscriptions.push(subscription);
          }

          // Update value
          count.value = 1;

          // Cleanup subscriptions
          subscriptions.forEach(unsubscribe => unsubscribe());
        },
        { maxMemoryLeak: 1024 * 1024, iterations: 5 }
      );
      results.push({ ...result2, testName: 'Rx Subscription Memory Test' });

      setTestResults(results);

      // Generate report
      const runner = new FloxTestRunner();
      runner['results'] = results;
      const testReport = runner.generateReport();
      setReport(testReport);

    } catch (error) {
      console.error('Rx test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setReport('');

    const testSuite = {
      name: 'Complete Flox Test Suite',
      tests: [
        async () => {
          const result = await FloxTestRunner.testController(
            TestController,
            async (controller) => {
              controller.increment();
              if (controller.count.value !== 1) {
                throw new Error('Expected count to be 1');
              }
            }
          );
          if (!result.success) throw new Error(result.error?.message);
        },
        async () => {
          const result = await FloxTestRunner.testController(
            TestController,
            async (controller) => {
              await controller.loadData();
              if (controller.name.value !== 'Test User') {
                throw new Error('Expected name to be Test User');
              }
            }
          );
          if (!result.success) throw new Error(result.error?.message);
        },
        async () => {
          const result = await FloxTestRunner.testPerformance(
            async () => {
              const controller = new TestController();
              for (let i = 0; i < 100; i++) {
                controller.increment();
              }
            },
            { maxDuration: 5, iterations: 3 }
          );
          if (!result.success) throw new Error(result.error?.message);
        }
      ]
    };

    try {
      const runner = new FloxTestRunner();
      const results = await runner.runTestSuite(testSuite);
      setTestResults(results);
      setReport(runner.generateReport());
    } catch (error) {
      console.error('Test suite execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';


  return (
    <div className="testing-demo" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🧪 Flox Testing Framework Demo</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>Test Controls</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={runBasicTests}
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1
            }}
          >
            {isRunning ? 'Running...' : 'Run Basic Tests'}
          </button>
          
          <button
            onClick={runRxTests}
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1
            }}
          >
            {isRunning ? 'Running...' : 'Run Rx Tests'}
          </button>
          
          <button
            onClick={runAllTests}
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1
            }}
          >
            {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#555', marginBottom: '15px' }}>Test Results</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{getStatusIcon(result.success)}</span>
                  <span style={{ fontWeight: '600', color: '#374151' }}>
                    {result.testName || `Test ${index + 1}`}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    backgroundColor: result.success ? '#dcfce7' : '#fee2e2',
                    color: result.success ? '#166534' : '#dc2626'
                  }}>
                    {result.testType}
                  </span>
                </div>
                
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Duration: {result.duration.toFixed(2)}ms
                </div>
                
                {result.error && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    backgroundColor: '#fee2e2', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#dc2626'
                  }}>
                    Error: {result.error.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {report && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#555', marginBottom: '15px' }}>Test Report</h2>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {report}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>Features Demonstrated</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
            <strong>🧪 Unit Testing:</strong> Test individual controllers and methods
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
            <strong>🔗 Integration Testing:</strong> Test API interactions and data flow
          </div>
          <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
            <strong>⚡ Performance Testing:</strong> Measure execution time and efficiency
          </div>
          <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
            <strong>🧠 Memory Leak Testing:</strong> Detect memory leaks and cleanup issues
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f3e8ff', borderRadius: '6px' }}>
            <strong>🎭 Mock API:</strong> Mock API responses and errors for testing
          </div>
          <div style={{ padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '6px' }}>
            <strong>📊 Test Reports:</strong> Generate detailed test reports and summaries
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>How to Use</h2>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#374151', marginBottom: '10px' }}>1. Import Testing Framework</h3>
          <pre style={{ 
            backgroundColor: '#1f2937', 
            color: '#f9fafb', 
            padding: '15px', 
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`import { 
  FloxTestRunner, 
  FloxTestUtils 
} from 'flox';`}
          </pre>

          <h3 style={{ color: '#374151', marginBottom: '10px', marginTop: '20px' }}>2. Write Tests</h3>
          <pre style={{ 
            backgroundColor: '#1f2937', 
            color: '#f9fafb', 
            padding: '15px', 
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`describe('UserController', () => {
  let controller: UserController;
  let utils: FloxTestUtils;

  beforeEach(() => {
    utils = new FloxTestUtils();
    utils.setupTestEnvironment();
    controller = FloxTestUtils.createMockController(UserController);
  });

  it('should load user data', async () => {
    const mockUser = FloxTestUtils.createTestUser(1);
    utils.mockApiResponse('/api/user/1', mockUser);
    
    await controller.loadUser(1);
    
    expect(controller.user.value).toEqual(mockUser);
  });
});`}
          </pre>

          <h3 style={{ color: '#374151', marginBottom: '10px', marginTop: '20px' }}>3. Run Performance Tests</h3>
          <pre style={{ 
            backgroundColor: '#1f2937', 
            color: '#f9fafb', 
            padding: '15px', 
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`const result = await FloxTestRunner.testPerformance(
  async () => {
    for (let i = 0; i < 1000; i++) {
      controller.count.value = i;
    }
  },
  { maxDuration: 100, iterations: 10 }
);`}
          </pre>
        </div>
      </div>

      <style>{`
        .testing-demo button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .testing-demo button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}; 