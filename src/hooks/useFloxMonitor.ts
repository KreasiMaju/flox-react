import { useEffect, useMemo, useState } from 'react';
import { floxMonitor, FloxError, FloxWarning } from '../core/FloxMonitor';
import { useRx } from './useRx';

export interface UseFloxMonitorOptions {
  enablePatternDetection?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableVisualFeedback?: boolean;
  componentName?: string;
}

export interface FloxMonitorStats {
  errorCount: number;
  warningCount: number;
  currentErrors: number;
  currentWarnings: number;
}

export function useFloxMonitor(options: UseFloxMonitorOptions = {}) {
  const {
    enablePatternDetection = true,
    enablePerformanceMonitoring = true,
    enableVisualFeedback = true,
    componentName
  } = options;

  // Get current errors and warnings
  const [errors, setErrors] = useState<FloxError[]>([]);
  const [warnings, setWarnings] = useState<FloxWarning[]>([]);

  useEffect(() => {
    const errorsSubscription = floxMonitor.getErrors().subscribe(setErrors);
    const warningsSubscription = floxMonitor.getWarnings().subscribe(setWarnings);
    
    return () => {
      errorsSubscription();
      warningsSubscription();
    };
  }, []);

  // Get statistics - memoize to prevent unnecessary recalculations
  const stats = useMemo(() => floxMonitor.getStats(), [errors.length, warnings.length]);

  // Pattern detection for current component
  const detectPatterns = (code: string, controllerName?: string) => {
    if (!enablePatternDetection) return;
    
    floxMonitor.detectBadPatterns(code, {
      component: componentName,
      controller: controllerName
    });
  };

  // Manual error reporting
  const reportError = (error: Omit<FloxError, 'id' | 'timestamp'>) => {
    floxMonitor.reportError({
      ...error,
      component: componentName
    });
  };

  // Manual warning reporting
  const reportWarning = (warning: Omit<FloxWarning, 'id' | 'timestamp'>) => {
    floxMonitor.reportWarning({
      ...warning,
      component: componentName
    });
  };

  // Enable/disable monitoring
  const enableMonitoring = () => floxMonitor.enable();
  const disableMonitoring = () => floxMonitor.disable();

  // Clear errors and warnings
  const clearErrors = () => floxMonitor.clearErrors();
  const clearWarnings = () => floxMonitor.clearWarnings();

  // Setup component-specific monitoring
  useEffect(() => {
    if (componentName) {
      console.log(`🔍 Flox Monitor: Monitoring component "${componentName}"`);
    }
  }, [componentName]);

  return {
    // Data
    errors,
    warnings,
    stats,
    
    // Actions
    detectPatterns,
    reportError,
    reportWarning,
    enableMonitoring,
    disableMonitoring,
    clearErrors,
    clearWarnings,
    
    // Utilities
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    totalIssues: errors.length + warnings.length,
    
      // Component-specific errors/warnings - memoized to prevent unnecessary filtering
  componentErrors: useMemo(() => 
    errors.filter(error => error.component === componentName), 
    [errors, componentName]
  ),
  componentWarnings: useMemo(() => 
    warnings.filter(warning => warning.component === componentName), 
    [warnings, componentName]
  ),
  };
}

// Hook untuk monitoring performa komponen
export function useFloxPerformanceMonitor(componentName: string) {
  const { reportWarning } = useFloxMonitor({ componentName });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Report slow renders
      if (renderTime > 16) { // 60fps threshold
        reportWarning({
          type: 'performance',
          message: 'Slow component render detected',
          details: `Component "${componentName}" took ${renderTime.toFixed(2)}ms to render`,
          suggestions: [
            'Use React.memo to prevent unnecessary re-renders',
            'Optimize Rx variable usage',
            'Check for expensive computations in render'
          ]
        });
      }
    };
  });

  // Monitor re-render frequency
  useEffect(() => {
    let renderCount = 0;
    let isDisposed = false;
    
    const interval = setInterval(() => {
      if (isDisposed) return;
      
      renderCount++;
      
      if (renderCount > 50) { // More than 50 renders in 5 seconds
        reportWarning({
          type: 'performance',
          message: 'High re-render frequency detected',
          details: `Component "${componentName}" re-rendered ${renderCount} times in 5 seconds`,
          suggestions: [
            'Check for unnecessary Rx subscriptions',
            'Use useMemo for expensive computations',
            'Consider using React.memo'
          ]
        });
      }
    }, 5000);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [componentName, reportWarning]);
}

// Hook untuk monitoring memory usage
export function useFloxMemoryMonitor(componentName: string) {
  const { reportWarning } = useFloxMonitor({ componentName });

  useEffect(() => {
    if (typeof performance === 'undefined' || !(performance as any).memory) return;

    let isDisposed = false;
    
    const interval = setInterval(() => {
      if (isDisposed) return;
      
      const usedMemory = (performance as any).memory.usedJSHeapSize;
      const maxMemory = (performance as any).memory.jsHeapSizeLimit;
      const memoryUsage = (usedMemory / maxMemory) * 100;

      if (memoryUsage > 85) {
        reportWarning({
          type: 'memory',
          message: 'Critical memory usage detected',
          details: `Memory usage: ${Math.round(memoryUsage)}%`,
          suggestions: [
            'Check for memory leaks in component',
            'Dispose unused Rx variables',
            'Clean up event listeners and intervals'
          ]
        });
      }
    }, 10000);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [componentName, reportWarning]);
}

// Hook untuk monitoring error boundaries
export function useFloxErrorBoundary(componentName: string) {
  const { reportError } = useFloxMonitor({ componentName });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError({
        type: 'error',
        message: 'JavaScript error caught',
        details: event.message,
        stack: event.error?.stack,
        suggestions: [
          'Check component logic',
          'Verify Rx variable usage',
          'Ensure proper error handling'
        ]
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError({
        type: 'critical',
        message: 'Unhandled promise rejection',
        details: event.reason?.message || 'Unknown error',
        stack: event.reason?.stack,
        suggestions: [
          'Add try-catch blocks to async operations',
          'Handle promise rejections properly',
          'Check controller async methods'
        ]
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [componentName, reportError]);
} 