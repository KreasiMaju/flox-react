import { Subject } from './Subject';

export interface FloxError {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  details: string;
  timestamp: Date;
  component?: string;
  controller?: string;
  stack?: string;
  suggestions?: string[];
}

export interface FloxWarning {
  id: string;
  type: 'performance' | 'memory' | 'pattern';
  message: string;
  details: string;
  timestamp: Date;
  component?: string;
  controller?: string;
  suggestions?: string[];
}

export class FloxMonitor {
  private static instance: FloxMonitor;
  private errors = new Subject<FloxError[]>([]);
  private warnings = new Subject<FloxWarning[]>([]);
  private isEnabled = true;
  private errorCount = 0;
  private warningCount = 0;
  private _isDisposed = false;
  private _memoryInterval: number | null = null;

  // Pattern detection
  private badPatterns = {
    controllerCreatedEveryRender: /new\s+\w+Controller\s*\(\s*\)/g,
    directRxAccess: /\.value\s*[^=]/g,
    missingUseController: /useRx\s*\(\s*controller\./g,
    expensiveComputation: /\.map\s*\(\s*.*=>\s*.*\.filter\s*\(\s*.*=>\s*.*\.map\s*\(\s*.*=>\s*.*\.reduce/g,
    memoryLeak: /addEventListener\s*\([^)]+\)\s*(?!.*removeEventListener)/g,
    multipleUpdates: /\.value\s*=\s*[^;]+;\s*.*\.value\s*=\s*[^;]+/g,
  };

  private constructor() {
    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): FloxMonitor {
    if (!FloxMonitor.instance) {
      FloxMonitor.instance = new FloxMonitor();
    }
    return FloxMonitor.instance;
  }

  // Enable/Disable monitoring
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // Error reporting
  reportError(error: Omit<FloxError, 'id' | 'timestamp'>) {
    if (!this.isEnabled) return;

    const floxError: FloxError = {
      ...error,
      id: `error_${++this.errorCount}`,
      timestamp: new Date(),
    };

    const currentErrors = this.errors.value;
    this.errors.next([...currentErrors, floxError]);

    // Log to console
    console.error('🚨 Flox Error:', floxError);

    // Trigger visual feedback
    this.triggerVisualFeedback('error', floxError);
  }

  reportWarning(warning: Omit<FloxWarning, 'id' | 'timestamp'>) {
    if (!this.isEnabled) return;

    const floxWarning: FloxWarning = {
      ...warning,
      id: `warning_${++this.warningCount}`,
      timestamp: new Date(),
    };

    const currentWarnings = this.warnings.value;
    this.warnings.next([...currentWarnings, floxWarning]);

    // Log to console
    console.warn('⚠️ Flox Warning:', floxWarning);

    // Trigger visual feedback
    this.triggerVisualFeedback('warning', floxWarning);
  }

  // Pattern detection
  detectBadPatterns(code: string, context: { component?: string; controller?: string }) {
    if (!this.isEnabled) return;

    // Check for controller created every render
    if (this.badPatterns.controllerCreatedEveryRender.test(code)) {
      this.reportWarning({
        type: 'pattern',
        message: 'Controller created every render detected',
        details: 'Creating controller instances in render function causes performance issues',
        component: context.component,
        controller: context.controller,
        suggestions: [
          'Use useMemo to create controller: const controller = useMemo(() => new UserController(), [])',
          'Move controller creation outside component',
          'Use useController hook properly'
        ]
      });
    }

    // Check for direct Rx access
    if (this.badPatterns.directRxAccess.test(code)) {
      this.reportError({
        type: 'error',
        message: 'Direct Rx variable access detected',
        details: 'Accessing .value directly bypasses React reactivity',
        component: context.component,
        controller: context.controller,
        suggestions: [
          'Use useRx hook: const [value] = useRx(controller.rxVariable)',
          'Use .subscribe() for side effects',
          'Access .value only in event handlers'
        ]
      });
    }

    // Check for missing useController
    if (this.badPatterns.missingUseController.test(code)) {
      this.reportError({
        type: 'error',
        message: 'Missing useController hook',
        details: 'Rx variables must be used with useController for proper React integration',
        component: context.component,
        controller: context.controller,
        suggestions: [
          'Wrap controller with useController: const controller = useController(new UserController())',
          'Use useControllerFromBinding for binding-based controllers'
        ]
      });
    }

    // Check for expensive computations
    if (this.badPatterns.expensiveComputation.test(code)) {
      this.reportWarning({
        type: 'performance',
        message: 'Expensive computation detected',
        details: 'Chaining multiple array operations can cause performance issues',
        component: context.component,
        controller: context.controller,
        suggestions: [
          'Use .where() for filtering',
          'Cache expensive computations',
          'Break down complex operations'
        ]
      });
    }

    // Check for memory leaks
    if (this.badPatterns.memoryLeak.test(code)) {
      this.reportError({
        type: 'critical',
        message: 'Potential memory leak detected',
        details: 'Event listeners added without cleanup',
        component: context.component,
        controller: context.controller,
        suggestions: [
          'Store cleanup functions in onInit',
          'Call cleanup in onDispose',
          'Use AbortController for modern event handling'
        ]
      });
    }

    // Check for multiple updates
    if (this.badPatterns.multipleUpdates.test(code)) {
      this.reportWarning({
        type: 'performance',
        message: 'Multiple Rx updates detected',
        details: 'Multiple .value assignments trigger multiple re-renders',
        component: context.component,
        controller: context.controller,
        suggestions: [
          'Batch updates into single operation',
          'Use .update() for complex updates',
          'Combine multiple changes into one'
        ]
      });
    }
  }

  // Performance monitoring
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor re-renders
    let renderCount = 0;
    let lastWarningTime = 0;
    const originalRender = console.log;
    
    console.log = (...args) => {
      if (args[0]?.includes('🔄 Component rendered')) {
        renderCount++;
        const now = Date.now();
        
        // Only warn once per minute to avoid spam
        if (renderCount > 100 && (now - lastWarningTime) > 60000) {
          lastWarningTime = now;
          this.reportWarning({
            type: 'performance',
            message: 'High re-render count detected',
            details: `Component has re-rendered ${renderCount} times`,
            suggestions: [
              'Use React.memo for expensive components',
              'Optimize Rx variable usage',
              'Check for unnecessary subscriptions'
            ]
          });
        }
      }
      originalRender.apply(console, args);
    };

    // Monitor memory usage with cleanup
    if ((performance as any).memory) {
      let memoryInterval: number | null = null;
      
      const checkMemory = () => {
        if (this._isDisposed) return;
        
        const usedMemory = (performance as any).memory.usedJSHeapSize;
        const maxMemory = (performance as any).memory.jsHeapSizeLimit;
        const memoryUsage = (usedMemory / maxMemory) * 100;

        if (memoryUsage > 80) {
          this.reportWarning({
            type: 'memory',
            message: 'High memory usage detected',
            details: `Memory usage: ${Math.round(memoryUsage)}%`,
            suggestions: [
              'Check for memory leaks',
              'Dispose unused Rx variables',
              'Clean up event listeners'
            ]
          });
        }
      };
      
      memoryInterval = window.setInterval(checkMemory, 10000);
      
      // Store interval for cleanup
      this._memoryInterval = memoryInterval;
    }
  }

  // Global error handling
  private setupGlobalErrorHandling() {
    if (typeof window === 'undefined') return;

    // Catch React errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      // Check for Flox-related errors
      if (errorMessage.includes('useController') || 
          errorMessage.includes('useRx') || 
          errorMessage.includes('Controller')) {
        this.reportError({
          type: 'error',
          message: 'React error in Flox code',
          details: errorMessage,
          suggestions: [
            'Check controller initialization',
            'Verify useController usage',
            'Ensure proper cleanup'
          ]
        });
      }
      
      originalError.apply(console, args);
    };

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
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
    });
  }

  // Visual feedback
  private triggerVisualFeedback(type: 'error' | 'warning', data: FloxError | FloxWarning) {
    if (typeof window === 'undefined') return;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `flox-notification flox-${type}`;
    notification.innerHTML = `
      <div class="flox-notification-header">
        <span class="flox-notification-icon">${type === 'error' ? '🚨' : '⚠️'}</span>
        <span class="flox-notification-title">${data.message}</span>
        <button class="flox-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="flox-notification-body">
        <p>${data.details}</p>
        ${data.suggestions ? `
          <div class="flox-suggestions">
            <strong>Suggestions:</strong>
            <ul>
              ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${data.component ? `<p><strong>Component:</strong> ${data.component}</p>` : ''}
        ${data.controller ? `<p><strong>Controller:</strong> ${data.controller}</p>` : ''}
      </div>
    `;

    // Add styles
    if (!document.getElementById('flox-monitor-styles')) {
      const styles = document.createElement('style');
      styles.id = 'flox-monitor-styles';
      styles.textContent = `
        .flox-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 400px;
          max-width: 90vw;
          background: white;
          border: 2px solid;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: flox-slide-in 0.3s ease-out;
        }
        
        .flox-error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        
        .flox-warning {
          border-color: #f59e0b;
          background: #fffbeb;
        }
        
        .flox-notification-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
        }
        
        .flox-notification-icon {
          margin-right: 8px;
          font-size: 18px;
        }
        
        .flox-notification-title {
          flex: 1;
          color: #374151;
        }
        
        .flox-notification-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .flox-notification-close:hover {
          color: #374151;
        }
        
        .flox-notification-body {
          padding: 16px;
          color: #374151;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .flox-notification-body p {
          margin: 0 0 12px 0;
        }
        
        .flox-suggestions {
          margin-top: 12px;
          padding: 12px;
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
        }
        
        .flox-suggestions ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }
        
        .flox-suggestions li {
          margin-bottom: 4px;
        }
        
        @keyframes flox-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .flox-screen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(239, 68, 68, 0.1);
          z-index: 9999;
          pointer-events: none;
          animation: flox-pulse 2s ease-in-out infinite;
        }
        
        @keyframes flox-pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `;
      document.head.appendChild(styles);
    }

    // Add notification to page
    document.body.appendChild(notification);

    // Add screen overlay for critical errors
    if (type === 'error' && data.type === 'critical') {
      const overlay = document.createElement('div');
      overlay.className = 'flox-screen-overlay';
      document.body.appendChild(overlay);
      
      // Remove overlay after 3 seconds
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 3000);
    }

    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  // Get current errors and warnings
  getErrors() {
    return this.errors;
  }

  getWarnings() {
    return this.warnings;
  }

  // Clear errors and warnings
  clearErrors() {
    this.errors.next([]);
  }

  clearWarnings() {
    this.warnings.next([]);
  }

  // Get statistics
  getStats() {
    return {
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      currentErrors: this.errors.value.length,
      currentWarnings: this.warnings.value.length,
    };
  }

  // Dispose method for cleanup
  dispose() {
    if (this._isDisposed) return;
    
    this._isDisposed = true;
    this.isEnabled = false;
    
    // Clear intervals
    if (this._memoryInterval) {
      clearInterval(this._memoryInterval);
      this._memoryInterval = null;
    }
    
    // Clear all errors and warnings
    this.clearErrors();
    this.clearWarnings();
    
    // Dispose subjects
    this.errors.dispose();
    this.warnings.dispose();
  }
}

// Export singleton instance
export const floxMonitor = FloxMonitor.getInstance(); 