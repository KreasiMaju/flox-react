// Core exports
export { Controller } from './core/Controller';
export { Binding } from './core/Binding';
export { Flox } from './core/Flox';

export { Rx, rx, rxInt, rxString, rxBool } from './core/Rx';
export { Subject } from './core/Subject';

export { BackgroundWorker } from './core/Worker';

// Monitoring exports
export { FloxMonitor, floxMonitor, type FloxError, type FloxWarning } from './core/FloxMonitor';
export { 
  useFloxMonitor, 
  useFloxPerformanceMonitor, 
  useFloxMemoryMonitor, 
  useFloxErrorBoundary,
  type UseFloxMonitorOptions,
  type FloxMonitorStats
} from './hooks/useFloxMonitor';
export { 
  useFloxMonitorOptimized,
  useFloxPerformanceMonitorOptimized,
  useFloxMemoryMonitorOptimized,
  type UseFloxMonitorOptimizedOptions
} from './hooks/useFloxMonitorOptimized';
export { FloxMonitorDashboard } from './components/FloxMonitorDashboard';

// Hooks exports
export { useRx } from './hooks/useRx';
export { useController } from './hooks/useController';
export { useBinding } from './hooks/useBinding';

// Components exports
export { HomePage } from './components/HomePage';
export { SimpleHomePage } from './components/SimpleHomePage';
export { AdvancedDemo } from './components/AdvancedDemo';
export { MonitorDemo } from './components/MonitorDemo'; 
export { TestingDemo } from './components/TestingDemo';

// Router exports
export { 
  FloxRouter, 
  floxRouter,
  type Route,
  type RouteMatch,
  type NavigationOptions,
  type RouterState
} from './core/Router';
export { 
  Router,
  Link,
  Navigate,
  useRouter,
  useRouteParams,
  useRouteMatch,
  useNavigation,
  type RouterProps,
  type LinkProps,
  type NavigateProps
} from './components/Router';
export { RouterDemo } from './components/RouterDemo';

// Testing Framework exports
export { 
  FloxTestUtils, 
  floxTestUtils,
  type MockApiResponse,
  type MockApiError,
  type TestEnvironment
} from './testing/FloxTestUtils';
export { 
  FloxTestRunner, 
  floxTestRunner,
  type TestResult,
  type PerformanceTestOptions,
  type MemoryTestOptions,
  type TestSuite,
  type TestFunction
} from './testing/FloxTestRunner'; 