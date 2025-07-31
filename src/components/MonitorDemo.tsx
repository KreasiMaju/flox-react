import React, { useState } from 'react';
import { useFloxMonitor, useFloxPerformanceMonitor, useFloxMemoryMonitor, useFloxErrorBoundary } from '../hooks/useFloxMonitor';
import { FloxMonitorDashboard } from './FloxMonitorDashboard';

// ❌ Bad Controller - Created every render
class BadController {
  data = { count: 0 };
  
  increment() {
    this.data.count++;
  }
}

// ❌ Bad Component - Multiple anti-patterns
export const BadComponent: React.FC = () => {
  // ❌ Controller created every render
  const badController = new BadController();
  
  // ❌ Direct state access
  const [count, setCount] = useState(0);
  
  // ❌ Expensive computation every render
  const expensiveValue = Array.from({ length: 10000 }, (_, i) => i)
    .filter(i => i % 2 === 0)
    .map(i => i * 2)
    .reduce((sum, i) => sum + i, 0);
  
  // ❌ Event listener without cleanup
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      console.log('Window resized');
    });
  }, []);
  
  // ❌ Multiple state updates
  const handleBadClick = () => {
    setCount(count + 1);
    setCount(count + 2); // This won't work as expected
    setCount(count + 3); // This won't work as expected
  };
  
  return (
    <div>
      <h3>❌ Bad Component (Will trigger warnings)</h3>
      <p>Count: {count}</p>
      <p>Expensive Value: {expensiveValue}</p>
      <button onClick={handleBadClick}>Bad Click</button>
      <button onClick={() => badController.increment()}>
        Bad Controller: {badController.data.count}
      </button>
    </div>
  );
};

// ✅ Good Component - Following best practices
export const GoodComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  
  // ✅ Memoized expensive computation
  const expensiveValue = React.useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => i)
      .filter(i => i % 2 === 0)
      .map(i => i * 2)
      .reduce((sum, i) => sum + i, 0);
  }, []);
  
  // ✅ Proper event listener cleanup
  React.useEffect(() => {
    const handleResize = () => {
      console.log('Window resized');
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // ✅ Single state update
  const handleGoodClick = () => {
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <h3>✅ Good Component (No warnings)</h3>
      <p>Count: {count}</p>
      <p>Expensive Value: {expensiveValue}</p>
      <button onClick={handleGoodClick}>Good Click</button>
    </div>
  );
};

// Demo component untuk testing monitoring
export const MonitorDemo: React.FC = () => {
  const { reportError, reportWarning, detectPatterns } = useFloxMonitor({
    componentName: 'MonitorDemo'
  });
  
  // Setup monitoring hooks
  useFloxPerformanceMonitor('MonitorDemo');
  useFloxMemoryMonitor('MonitorDemo');
  useFloxErrorBoundary('MonitorDemo');
  
  const [showBadComponent, setShowBadComponent] = useState(false);
  const [showGoodComponent, setShowGoodComponent] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  
  // Manual error/warning testing
  const testManualError = () => {
    reportError({
      type: 'error',
      message: 'Manual error test',
      details: 'This is a manually triggered error for testing purposes',
      suggestions: [
        'This is just a test error',
        'You can safely ignore this',
        'Use this to test error handling'
      ]
    });
  };
  
  const testManualWarning = () => {
    reportWarning({
      type: 'performance',
      message: 'Manual warning test',
      details: 'This is a manually triggered warning for testing purposes',
      suggestions: [
        'This is just a test warning',
        'You can safely ignore this',
        'Use this to test warning handling'
      ]
    });
  };
  
  const testCriticalError = () => {
    reportError({
      type: 'critical',
      message: 'Critical error test',
      details: 'This will trigger a red screen overlay',
      suggestions: [
        'This simulates a critical error',
        'Check the visual feedback',
        'The overlay should appear briefly'
      ]
    });
  };
  
  const testMemoryLeak = () => {
    // Simulate memory leak
    const interval = setInterval(() => {
      const arr = new Array(1000000).fill('memory leak');
      console.log('Memory leak simulation:', arr.length);
    }, 100);
    
    // Don't clear the interval - this will cause memory issues
    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
    
    reportWarning({
      type: 'memory',
      message: 'Memory leak simulation started',
      details: 'Creating large arrays every 100ms for 5 seconds',
      suggestions: [
        'Check memory usage in DevTools',
        'This will trigger memory warnings',
        'The interval will be cleared after 5 seconds'
      ]
    });
  };
  
  const testPerformanceIssue = () => {
    // Simulate performance issue
    const start = performance.now();
    
    // Expensive operation
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(i) * Math.PI;
    }
    
    const end = performance.now();
    const duration = end - start;
    
    reportWarning({
      type: 'performance',
      message: 'Performance issue detected',
      details: `Expensive operation took ${duration.toFixed(2)}ms`,
      suggestions: [
        'Move expensive operations outside render',
        'Use useMemo for expensive computations',
        'Consider using Web Workers for heavy tasks'
      ]
    });
  };
  
  const testPatternDetection = () => {
    // Test pattern detection with bad code
    const badCode = `
      const controller = new UserController(); // Bad pattern
      const value = controller.data.value; // Direct access
      controller.data.value = newValue; // Direct assignment
    `;
    
    detectPatterns(badCode, { controller: 'UserController' });
  };
  
  const testUnhandledPromise = () => {
    // Simulate unhandled promise rejection
    Promise.reject(new Error('Unhandled promise rejection test'));
  };
  
  const testJavaScriptError = () => {
    // Simulate JavaScript error
    throw new Error('JavaScript error test');
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Flox Monitor Demo</h1>
      <p>This demo shows how Flox Monitor detects various issues and provides visual feedback.</p>
      
      {/* Control Panel */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3>🎮 Test Controls</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={testManualError}
            style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🚨 Test Manual Error
          </button>
          
          <button 
            onClick={testManualWarning}
            style={{ padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ⚠️ Test Manual Warning
          </button>
          
          <button 
            onClick={testCriticalError}
            style={{ padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🔥 Test Critical Error
          </button>
          
          <button 
            onClick={testMemoryLeak}
            style={{ padding: '10px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🧠 Test Memory Leak
          </button>
          
          <button 
            onClick={testPerformanceIssue}
            style={{ padding: '10px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ⚡ Test Performance Issue
          </button>
          
          <button 
            onClick={testPatternDetection}
            style={{ padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🔍 Test Pattern Detection
          </button>
          
          <button 
            onClick={testUnhandledPromise}
            style={{ padding: '10px', background: '#f97316', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            📝 Test Unhandled Promise
          </button>
          
          <button 
            onClick={testJavaScriptError}
            style={{ padding: '10px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            💥 Test JavaScript Error
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowBadComponent(!showBadComponent)}
            style={{ padding: '10px', background: showBadComponent ? '#ef4444' : '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showBadComponent ? 'Hide' : 'Show'} Bad Component
          </button>
          
          <button 
            onClick={() => setShowGoodComponent(!showGoodComponent)}
            style={{ padding: '10px', background: showGoodComponent ? '#10b981' : '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showGoodComponent ? 'Hide' : 'Show'} Good Component
          </button>
          
          <button 
            onClick={() => setShowDashboard(!showDashboard)}
            style={{ padding: '10px', background: showDashboard ? '#3b82f6' : '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showDashboard ? 'Hide' : 'Show'} Monitor Dashboard
          </button>
        </div>
      </div>
      
      {/* Component Demos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {showBadComponent && (
          <div style={{ 
            background: '#fef2f2', 
            padding: '20px', 
            borderRadius: '8px',
            border: '2px solid #ef4444'
          }}>
            <BadComponent />
          </div>
        )}
        
        {showGoodComponent && (
          <div style={{ 
            background: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '8px',
            border: '2px solid #10b981'
          }}>
            <GoodComponent />
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div style={{ 
        background: '#fef3c7', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h3>📋 Instructions</h3>
        <ul>
          <li><strong>Test Controls:</strong> Click buttons to manually trigger different types of errors and warnings</li>
          <li><strong>Bad Component:</strong> Shows anti-patterns that will trigger automatic warnings</li>
          <li><strong>Good Component:</strong> Shows best practices that won't trigger warnings</li>
          <li><strong>Monitor Dashboard:</strong> Shows real-time monitoring of errors and warnings</li>
          <li><strong>Visual Feedback:</strong> Notifications will appear in the top-right corner</li>
          <li><strong>Critical Errors:</strong> Will trigger a red screen overlay briefly</li>
        </ul>
      </div>
      
      {/* Monitor Dashboard */}
      {showDashboard && <FloxMonitorDashboard />}
    </div>
  );
}; 