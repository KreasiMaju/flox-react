import { useEffect, useState, useCallback } from 'react';
import { Controller } from '../core/Controller';
import { Subject } from '../core/Subject';

export function useController<T extends Controller>(controller: T): T {
  useEffect(() => {
    // Cleanup saat component unmount
    return () => {
      // Note: Controller tidak di-dispose otomatis karena bisa digunakan di multiple components
      // Dispose hanya dilakukan saat binding di-dispose
    };
  }, [controller]);

  return controller;
}

export function useSubject<T>(subject: Subject<T>): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(subject.value);

  useEffect(() => {
    const unsubscribe = subject.subscribe(setValue);
    return unsubscribe;
  }, [subject]);

  const updateValue = useCallback((newValue: T) => {
    subject.next(newValue);
  }, [subject]);

  return [value, updateValue];
}

export function useControllerSubject<T extends Controller, K extends keyof T['subjects']>(
  controller: T,
  subjectKey: K
): [any, (value: any) => void] {
  const subject = controller.subjects.get(subjectKey as string);
  
  if (!subject) {
    throw new Error(`Subject dengan key '${String(subjectKey)}' tidak ditemukan di controller`);
  }

  return useSubject(subject);
} 