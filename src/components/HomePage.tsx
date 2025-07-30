import React, { useMemo } from 'react';
import { useController, useSubject } from '../hooks/useController';
import { HomeController } from '../controllers/HomeController';

export const HomePage: React.FC = () => {
  // Setup controller langsung
  const homeController = useMemo(() => new HomeController(), []);
  useController(homeController);
  
  // Subscribe ke subjects
  const [count] = useSubject(homeController.getSubjectPublic('count')!);
  const [name] = useSubject(homeController.getSubjectPublic('name')!);
  const [isLoading] = useSubject(homeController.getSubjectPublic('isLoading')!);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Flox State Management Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Counter: {count as number}</h2>
        <button 
          onClick={() => homeController.increment()}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Increment
        </button>
        <button 
          onClick={() => homeController.decrement()}
          style={{ padding: '8px 16px' }}
        >
          Decrement
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Name: {name as string}</h2>
        <input
          type="text"
          value={name as string}
          onChange={(e) => homeController.updateName(e.target.value)}
          style={{ padding: '8px', width: '200px' }}
          placeholder="Enter your name"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Loading State: {(isLoading as boolean) ? 'Loading...' : 'Ready'}</h2>
        <button 
          onClick={() => homeController.fetchData()}
          disabled={isLoading as boolean}
          style={{ padding: '8px 16px' }}
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Debug Info:</h3>
        <p>Controller Subjects: {homeController.subjects.size}</p>
        <p>Is Controller Disposed: {homeController.isDisposed ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}; 