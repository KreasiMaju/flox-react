import React from 'react';
import { 
  Controller, 
  Subject, 
  useController, 
  useSubject 
} from '../index';

// Simple Counter Controller
class CounterController extends Controller {
  private _countSubject: Subject<number>;

  constructor() {
    super();
    this._countSubject = this.createSubject('count', 0);
  }

  get count(): number {
    return this._countSubject.value;
  }

  increment(): void {
    const current = this._countSubject.value;
    this._countSubject.next(current + 1);
  }

  decrement(): void {
    const current = this._countSubject.value;
    this._countSubject.next(current - 1);
  }

  reset(): void {
    this._countSubject.next(0);
  }
}

// Simple Counter Component
export const SimpleCounter: React.FC = () => {
  const controller = useController(new CounterController());
  const [count] = useSubject(controller.getSubjectPublic('count')!);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Simple Counter: {count as number}</h2>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={() => controller.increment()}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          +
        </button>
        <button 
          onClick={() => controller.decrement()}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          -
        </button>
        <button 
          onClick={() => controller.reset()}
          style={{ padding: '8px 16px' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}; 