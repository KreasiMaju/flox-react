import { useEffect, useMemo } from 'react';
import { Binding } from '../core/Binding';
import { Controller } from '../core/Controller';
import { flox } from '../core/Flox';

export function useBinding(key: string, binding: Binding): Binding {
  useEffect(() => {
    // Initialize binding jika belum
    if (!binding.isInitialized) {
      binding.initialize();
    }
    
    flox.putBinding(key, binding);
    
    return () => {
      flox.removeBinding(key);
    };
  }, [key, binding]);

  return binding;
}

export function useControllerFromBinding<T extends Controller>(
  binding: Binding, 
  controllerKey: string
): T {
  return useMemo(() => {
    return binding.getControllerPublic<T>(controllerKey)!;
  }, [binding, controllerKey]);
}

export function useGlobalController<T extends Controller>(key: string, controller: T): T {
  useEffect(() => {
    flox.putController(key, controller);
    
    return () => {
      flox.removeController(key);
    };
  }, [key, controller]);

  return controller;
} 