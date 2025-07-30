import React, { useMemo } from 'react';
import { useController, useSubject } from '../hooks/useController';
import { useBinding } from '../hooks/useBinding';
import { HomeBinding } from '../bindings/HomeBinding';
import { HomeController } from '../controllers/HomeController';
import { UserController } from '../controllers/UserController';
import { AppController } from '../controllers/AppController';
import { SettingsController } from '../controllers/SettingsController';

export const FenixPermanentDemo: React.FC = () => {
  // Setup controllers langsung untuk demo
  const homeController = useMemo(() => new HomeController(), []);
  const userController = useMemo(() => new UserController(), []);
  const appController = useMemo(() => new AppController(), []);
  const settingsController = useMemo(() => new SettingsController(), []);
  
  // Use controllers
  const homeControllerInstance = useController(homeController);
  const userControllerInstance = useController(userController);
  const appControllerInstance = useController(appController);
  const settingsControllerInstance = useController(settingsController);
  
  // Subscribe ke subjects
  const [count] = useSubject(homeControllerInstance.getSubjectPublic('count')!);
  const [userId] = useSubject(userControllerInstance.getSubjectPublic('userId')!);
  const [username] = useSubject(userControllerInstance.getSubjectPublic('username')!);
  const [theme] = useSubject(appControllerInstance.getSubjectPublic('theme')!);
  const [language] = useSubject(appControllerInstance.getSubjectPublic('language')!);
  const [notifications] = useSubject(settingsControllerInstance.getSubjectPublic('notifications')!);
  const [autoSave] = useSubject(settingsControllerInstance.getSubjectPublic('autoSave')!);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Flox - Fenix & Permanent Demo</h1>
      
      {/* Normal Controller */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h2>🔄 Normal Controller (Home)</h2>
        <p>Counter: {count as number}</p>
        <button onClick={() => homeControllerInstance.increment()} style={{ marginRight: '10px' }}>
          Increment
        </button>
        <button onClick={() => homeControllerInstance.decrement()}>
          Decrement
        </button>
      </div>

      {/* Fenix Controller */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #ffc107', borderRadius: '8px' }}>
        <h2>🦅 Fenix Controller (User) - Recreate setiap kali dibutuhkan</h2>
        <p>User ID: {userId as string || 'Not set'}</p>
        <p>Username: {username as string || 'Not set'}</p>
        <button 
          onClick={() => userControllerInstance.setUser('user123', 'John Doe')} 
          style={{ marginRight: '10px' }}
        >
          Set User
        </button>
        <button onClick={() => userControllerInstance.clearUser()}>
          Clear User
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          💡 Fenix controller akan di-recreate setiap kali dibutuhkan, state tidak dipertahankan
        </p>
      </div>

      {/* Permanent Controller */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #28a745', borderRadius: '8px' }}>
        <h2>🔒 Permanent Controller (App) - Tidak pernah di-dispose</h2>
        <p>Theme: {theme as string}</p>
        <p>Language: {language as string}</p>
        <button 
          onClick={() => appControllerInstance.setTheme(theme === 'light' ? 'dark' : 'light')} 
          style={{ marginRight: '10px' }}
        >
          Toggle Theme
        </button>
        <button onClick={() => appControllerInstance.setLanguage(language === 'en' ? 'id' : 'en')}>
          Toggle Language
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          💡 Permanent controller tidak pernah di-dispose, state dipertahankan selama aplikasi berjalan
        </p>
      </div>

      {/* Lazy Controller */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #6f42c1', borderRadius: '8px' }}>
        <h2>🦥 Lazy Controller (Settings) - Hanya dibuat saat pertama kali diakses</h2>
        <p>Notifications: {(notifications as boolean) ? 'ON' : 'OFF'}</p>
        <p>Auto Save: {(autoSave as boolean) ? 'ON' : 'OFF'}</p>
        <button 
          onClick={() => settingsControllerInstance.toggleNotifications()} 
          style={{ marginRight: '10px' }}
        >
          Toggle Notifications
        </button>
        <button onClick={() => settingsControllerInstance.toggleAutoSave()}>
          Toggle Auto Save
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          💡 Lazy controller hanya dibuat saat pertama kali diakses, menghemat memory
        </p>
      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 Debug Info:</h3>
        <p>Home Controller Subjects: {homeControllerInstance.subjects.size}</p>
        <p>User Controller Subjects: {userControllerInstance.subjects.size}</p>
        <p>App Controller Subjects: {appControllerInstance.subjects.size}</p>
        <p>Settings Controller Subjects: {settingsControllerInstance.subjects.size}</p>
        <p>All Controllers Loaded Successfully!</p>
      </div>
    </div>
  );
}; 