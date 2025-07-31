import React, { useMemo } from 'react';
import { useController } from '../hooks/useController';
import { useRx } from '../hooks/useRx';
import { AdvancedController } from '../controllers/AdvancedController';

export const AdvancedDemo: React.FC = () => {
  const controller = useMemo(() => new AdvancedController(), []);
  const advancedController = useController(controller);
  
  // Use Rx variables
  const [count, setCount] = useRx(advancedController.count);
  const [name] = useRx(advancedController.name);
  const [isLoading] = useRx(advancedController.isLoading);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Flox Advanced Features Demo</h1>
      
      {/* Rx Variables */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h2>🔄 Rx Variables</h2>
        <p>Count: {count}</p>
        <p>Name: {name}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => advancedController.increment()} style={{ marginRight: '10px' }}>
            Increment
          </button>
          <button onClick={() => advancedController.decrement()} style={{ marginRight: '10px' }}>
            Decrement
          </button>
          <button onClick={() => setCount(0)}>
            Reset
          </button>
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => advancedController.updateName(e.target.value)}
            placeholder="Enter name"
            style={{ marginRight: '10px', padding: '5px' }}
          />
        </div>
      </div>

      {/* Get Utilities */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #28a745', borderRadius: '8px' }}>
        <h2>🛠️ Get Utilities</h2>
        <button 
          onClick={() => advancedController.showSnackbar()} 
          style={{ marginRight: '10px' }}
        >
          Show Snackbar
        </button>
        <button onClick={() => advancedController.showDialog()}>
          Show Dialog
        </button>
      </div>

      {/* Worker */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #ffc107', borderRadius: '8px' }}>
        <h2>⚙️ Background Worker</h2>
        <p>Click to start background task that will add 10 to count after 2 seconds</p>
        <button 
          onClick={() => advancedController.startBackgroundTask()}
          disabled={isLoading}
          style={{ marginRight: '10px' }}
        >
          {isLoading ? 'Running...' : 'Start Background Task'}
        </button>
      </div>

      {/* Rx Operators */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #6f42c1', borderRadius: '8px' }}>
        <h2>🔧 Rx Operators</h2>
        <p>Count doubled: {advancedController.count.map(x => x * 2).value}</p>
        <p>Count is even: {advancedController.count.map(x => x % 2 === 0).value ? 'Yes' : 'No'}</p>
        <p>Name length: {advancedController.name.map(x => x.length).value}</p>
      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 Debug Info:</h3>
        <p>Controller Subjects: {advancedController.subjects.size}</p>
        <p>Is Controller Disposed: {advancedController.isDisposed ? 'Yes' : 'No'}</p>
        <p>Worker Running: {isLoading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}; 