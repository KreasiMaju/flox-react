// Core exports
export { Controller } from './core/Controller';
export { Subject, type Observer } from './core/Subject';
export { Binding, type BindingInterface } from './core/Binding';
export { Flox, flox } from './core/Flox';
export { Rx, rx, rxInt, rxString, rxBool } from './core/Rx';
export { FloxUtils } from './core/Get';
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
export { useController, useSubject, useControllerSubject } from './hooks/useController';
export { useBinding, useGlobalController } from './hooks/useBinding';
export { useRx, useRxValue } from './hooks/useRx';

// Example exports
export { HomeController, type HomeControllerInterface, type HomeControllerRepository, type HomeViewModel } from './controllers/HomeController';
export { UserController, type UserControllerInterface } from './controllers/UserController';
export { AppController, type AppControllerInterface } from './controllers/AppController';
export { SettingsController, type SettingsControllerInterface } from './controllers/SettingsController';
export { AdvancedController, type AdvancedControllerInterface } from './controllers/AdvancedController';
export { HomeBinding } from './bindings/HomeBinding';
// Removed SimpleCounter to avoid circular dependency
export { SimpleHomePage } from './components/SimpleHomePage';
export { FenixPermanentDemo } from './components/FenixPermanentDemo';
export { AdvancedDemo } from './components/AdvancedDemo';
export { MonitorDemo } from './components/MonitorDemo';
export { TestingDemo } from './components/TestingDemo';

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