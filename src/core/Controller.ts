import { Subject } from './Subject';

export abstract class Controller {
  private _subjects: Map<string, Subject<any>> = new Map();
  private _isDisposed = false;

  /**
   * Membuat reactive subject untuk state
   */
  protected createSubject<T>(key: string, initialValue: T): Subject<T> {
    if (this._subjects.has(key)) {
      return this._subjects.get(key)!;
    }
    
    const subject = new Subject<T>(initialValue);
    this._subjects.set(key, subject);
    return subject;
  }

  /**
   * Mendapatkan subject berdasarkan key
   */
  protected getSubject<T>(key: string): Subject<T> | undefined {
    return this._subjects.get(key);
  }

  /**
   * Public method untuk mendapatkan subject
   */
  public getSubjectPublic<T>(key: string): Subject<T> | undefined {
    return this.getSubject<T>(key);
  }

  /**
   * Update nilai subject
   */
  protected updateSubject<T>(key: string, value: T): void {
    const subject = this._subjects.get(key);
    if (subject) {
      subject.next(value);
    }
  }

  /**
   * Lifecycle method - dipanggil saat controller diinisialisasi
   */
  onInit(): void {
    // Override di subclass jika diperlukan
  }

  /**
   * Lifecycle method - dipanggil saat controller akan dihapus
   */
  onDispose(): void {
    if (this._isDisposed) return;
    
    this._isDisposed = true;
    
    // Dispose semua subjects
    this._subjects.forEach(subject => subject.dispose());
    this._subjects.clear();
  }

  /**
   * Check apakah controller sudah di-dispose
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Mendapatkan semua subjects
   */
  get subjects(): Map<string, Subject<any>> {
    return this._subjects;
  }
} 