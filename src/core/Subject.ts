export type Observer<T> = (value: T) => void;

export class Subject<T> {
  private _value: T;
  private _observers: Set<Observer<T>> = new Set();
  private _isDisposed = false;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  /**
   * Mendapatkan nilai saat ini
   */
  get value(): T {
    return this._value;
  }

  /**
   * Subscribe ke perubahan nilai
   */
  subscribe(observer: Observer<T>): () => void {
    if (this._isDisposed) {
      throw new Error('Subject sudah di-dispose');
    }

    this._observers.add(observer);
    
    // Langsung panggil observer dengan nilai saat ini
    observer(this._value);

    // Return unsubscribe function
    return () => {
      this._observers.delete(observer);
    };
  }

  /**
   * Update nilai dan notify semua observers
   */
  next(value: T): void {
    if (this._isDisposed) return;

    this._value = value;
    this._observers.forEach(observer => {
      try {
        observer(value);
      } catch (error) {
        console.error('Error in observer:', error);
      }
    });
  }

  /**
   * Update nilai tanpa notify observers (untuk internal use)
   */
  setValue(value: T): void {
    if (this._isDisposed) return;
    this._value = value;
  }

  /**
   * Dispose subject
   */
  dispose(): void {
    if (this._isDisposed) return;
    
    this._isDisposed = true;
    this._observers.clear();
  }

  /**
   * Check apakah subject sudah di-dispose
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Jumlah observers yang aktif
   */
  get observerCount(): number {
    return this._observers.size;
  }
} 