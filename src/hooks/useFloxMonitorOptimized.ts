import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { floxMonitor, FloxError, FloxWarning } from '../core/FloxMonitor';

export interface UseFloxMonitorOptimizedOptions {
  enablePatternDetection?: boolean;
  componentName?: string;
  maxErrors?: number; // Limit jumlah error yang disimpan
  maxWarnings?: number; // Limit jumlah warning yang disimpan
  autoCleanup?: boolean; // Auto cleanup setelah interval tertentu
  cleanupInterval?: number; // Interval cleanup dalam ms
}

export interface FloxMonitorStats {
  errorCount: number;
  warningCount: number;
  currentErrors: number;
  currentWarnings: number;
}

export function useFloxMonitorOptimized(options: UseFloxMonitorOptimizedOptions = {}) {
  const {
    enablePatternDetection = true,
    componentName,
    maxErrors = 100,
    maxWarnings = 100,
    autoCleanup = true,
    cleanupInterval = 300000 // 5 menit
  } = options;

  // Use refs untuk mencegah re-render yang tidak perlu
  const errorsRef = useRef<FloxError[]>([]);
  const warningsRef = useRef<FloxWarning[]>([]);
  const [errors, setErrors] = useState<FloxError[]>([]);
  const [warnings, setWarnings] = useState<FloxWarning[]>([]);
  const cleanupTimeoutRef = useRef<number | null>(null);

  // Get statistics - memoized dengan dependencies yang tepat
  const stats = useMemo(() => floxMonitor.getStats(), [errors.length, warnings.length]);

  // Optimized pattern detection dengan debouncing
  const detectPatterns = useCallback((code: string, controllerName?: string) => {
    if (!enablePatternDetection) return;
    
    // Debounce pattern detection untuk mencegah spam
    const timeoutId = setTimeout(() => {
      floxMonitor.detectBadPatterns(code, {
        component: componentName,
        controller: controllerName
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [enablePatternDetection, componentName]);

  // Optimized error reporting dengan rate limiting
  const reportError = useCallback((error: Omit<FloxError, 'id' | 'timestamp'>) => {
    // Rate limiting - max 1 error per second per component
    const now = Date.now();
    const lastErrorTime = errorsRef.current[errorsRef.current.length - 1]?.timestamp?.getTime() || 0;
    
    if (now - lastErrorTime < 1000) return; // Skip jika terlalu cepat

    floxMonitor.reportError({
      ...error,
      component: componentName
    });
  }, [componentName]);

  // Optimized warning reporting dengan rate limiting
  const reportWarning = useCallback((warning: Omit<FloxWarning, 'id' | 'timestamp'>) => {
    // Rate limiting - max 1 warning per 2 seconds per component
    const now = Date.now();
    const lastWarningTime = warningsRef.current[warningsRef.current.length - 1]?.timestamp?.getTime() || 0;
    
    if (now - lastWarningTime < 2000) return; // Skip jika terlalu cepat

    floxMonitor.reportWarning({
      ...warning,
      component: componentName
    });
  }, [componentName]);

  // Enable/disable monitoring
  const enableMonitoring = useCallback(() => floxMonitor.enable(), []);
  const disableMonitoring = useCallback(() => floxMonitor.disable(), []);

  // Clear errors and warnings dengan cleanup
  const clearErrors = useCallback(() => {
    floxMonitor.clearErrors();
    errorsRef.current = [];
    setErrors([]);
  }, []);

  const clearWarnings = useCallback(() => {
    floxMonitor.clearWarnings();
    warningsRef.current = [];
    setWarnings([]);
  }, []);

  // Auto cleanup function
  const performAutoCleanup = useCallback(() => {
    if (!autoCleanup) return;
    
    const now = Date.now();
    const cutoffTime = now - cleanupInterval;
    
    // Remove old errors and warnings
    const filteredErrors = errorsRef.current.filter(error => 
      error.timestamp.getTime() > cutoffTime
    );
    const filteredWarnings = warningsRef.current.filter(warning => 
      warning.timestamp.getTime() > cutoffTime
    );
    
    if (filteredErrors.length !== errorsRef.current.length) {
      errorsRef.current = filteredErrors;
      setErrors(filteredErrors);
    }
    
    if (filteredWarnings.length !== warningsRef.current.length) {
      warningsRef.current = filteredWarnings;
      setWarnings(filteredWarnings);
    }
  }, [autoCleanup, cleanupInterval]);

  // Setup subscriptions dengan cleanup yang proper
  useEffect(() => {
    let isDisposed = false;
    
    const errorsSubscription = floxMonitor.getErrors().subscribe((newErrors) => {
      if (isDisposed) return;
      
      // Limit jumlah error yang disimpan
      const limitedErrors = newErrors.slice(-maxErrors);
      errorsRef.current = limitedErrors;
      setErrors(limitedErrors);
    });
    
    const warningsSubscription = floxMonitor.getWarnings().subscribe((newWarnings) => {
      if (isDisposed) return;
      
      // Limit jumlah warning yang disimpan
      const limitedWarnings = newWarnings.slice(-maxWarnings);
      warningsRef.current = limitedWarnings;
      setWarnings(limitedWarnings);
    });
    
    // Setup auto cleanup
    if (autoCleanup) {
      cleanupTimeoutRef.current = window.setInterval(performAutoCleanup, cleanupInterval);
    }
    
    return () => {
      isDisposed = true;
      errorsSubscription();
      warningsSubscription();
      
      if (cleanupTimeoutRef.current) {
        clearInterval(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
    };
  }, [maxErrors, maxWarnings, autoCleanup, cleanupInterval, autoCleanup]);

  // Setup component-specific monitoring
  useEffect(() => {
    if (componentName) {
      console.log(`🔍 Flox Monitor: Monitoring component "${componentName}"`);
    }
  }, [componentName]);

  // Memoized utilities untuk mencegah re-render
  const hasErrors = useMemo(() => errors.length > 0, [errors.length]);
  const hasWarnings = useMemo(() => warnings.length > 0, [warnings.length]);
  const totalIssues = useMemo(() => errors.length + warnings.length, [errors.length, warnings.length]);

  // Component-specific errors/warnings - memoized
  const componentErrors = useMemo(() => 
    errors.filter(error => error.component === componentName), 
    [errors, componentName]
  );
  
  const componentWarnings = useMemo(() => 
    warnings.filter(warning => warning.component === componentName), 
    [warnings, componentName]
  );

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
    hasErrors,
    hasWarnings,
    totalIssues,
    
    // Component-specific errors/warnings
    componentErrors,
    componentWarnings,
  };
}

// Optimized performance monitor dengan cleanup yang lebih baik
export function useFloxPerformanceMonitorOptimized(componentName: string) {
  const { reportWarning } = useFloxMonitorOptimized({ componentName });
  // Performance monitoring
  const lastWarningTimeRef = useRef(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Report slow renders dengan rate limiting
      if (renderTime > 16) { // 60fps threshold
        const now = Date.now();
        if (now - lastWarningTimeRef.current > 30000) { // Max 1 warning per 30 detik
          lastWarningTimeRef.current = now;
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
      }
    };
  });

  // Monitor re-render frequency dengan cleanup yang proper
  useEffect(() => {
    let renderCount = 0;
    let isDisposed = false;
    let lastResetTime = Date.now();
    
    const interval = setInterval(() => {
      if (isDisposed) return;
      
      renderCount++;
      const now = Date.now();
      
      // Reset counter setiap 5 detik
      if (now - lastResetTime > 5000) {
        renderCount = 1;
        lastResetTime = now;
      }
      
      if (renderCount > 50) { // More than 50 renders in 5 seconds
        const timeSinceLastWarning = now - lastWarningTimeRef.current;
        if (timeSinceLastWarning > 60000) { // Max 1 warning per minute
          lastWarningTimeRef.current = now;
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
      }
    }, 5000);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [componentName, reportWarning]);
}

// Optimized memory monitor
export function useFloxMemoryMonitorOptimized(componentName: string) {
  const { reportWarning } = useFloxMonitorOptimized({ componentName });
  const lastWarningTimeRef = useRef(0);

  useEffect(() => {
    if (typeof performance === 'undefined' || !(performance as any).memory) return;

    let isDisposed = false;
    
    const interval = setInterval(() => {
      if (isDisposed) return;
      
      const usedMemory = (performance as any).memory.usedJSHeapSize;
      const maxMemory = (performance as any).memory.jsHeapSizeLimit;
      const memoryUsage = (usedMemory / maxMemory) * 100;

      if (memoryUsage > 85) {
        const now = Date.now();
        if (now - lastWarningTimeRef.current > 60000) { // Max 1 warning per minute
          lastWarningTimeRef.current = now;
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
      }
    }, 10000);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [componentName, reportWarning]);
} 