import { useState, useEffect } from 'react';
import { Rx } from '../core/Rx';

export function useRx<T>(rx: Rx<T>): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(rx.value);

  useEffect(() => {
    const unsubscribe = rx.subscribe(setValue);
    return unsubscribe;
  }, [rx]);

  const updateValue = (newValue: T) => {
    rx.value = newValue;
  };

  return [value, updateValue];
}

export function useRxValue<T>(rx: Rx<T>): T {
  const [value] = useRx(rx);
  return value;
} 