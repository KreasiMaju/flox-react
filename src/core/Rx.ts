import { Subject } from './Subject';

export class Rx<T> {
  private _subject: Subject<T>;

  constructor(initialValue: T) {
    this._subject = new Subject<T>(initialValue);
  }

  get value(): T {
    return this._subject.value;
  }

  set value(newValue: T) {
    this._subject.next(newValue);
  }

  // Reactive operators
  map<U>(transform: (value: T) => U): Rx<U> {
    const newRx = new Rx<U>(transform(this.value));
    this._subject.subscribe(value => {
      newRx.value = transform(value);
    });
    return newRx;
  }

  where(predicate: (value: T) => boolean): Rx<T> {
    const newRx = new Rx<T>(this.value);
    this._subject.subscribe(value => {
      if (predicate(value)) {
        newRx.value = value;
      }
    });
    return newRx;
  }

  // Utility methods
  update(updater: (value: T) => T): void {
    this.value = updater(this.value);
  }

  // Subscribe
  subscribe(observer: (value: T) => void): () => void {
    return this._subject.subscribe(observer);
  }

  // Dispose
  dispose(): void {
    this._subject.dispose();
  }
}

// Factory functions
export function rx<T>(initialValue: T): Rx<T> {
  return new Rx<T>(initialValue);
}

export function rxInt(initialValue: number): Rx<number> {
  return new Rx<number>(initialValue);
}

export function rxString(initialValue: string): Rx<string> {
  return new Rx<string>(initialValue);
}

export function rxBool(initialValue: boolean): Rx<boolean> {
  return new Rx<boolean>(initialValue);
} 