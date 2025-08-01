import React from 'react';
import { Router, Link, useRouter, useRouteParams, useNavigation } from './Router';
import { Route } from '../core/Router';

// Demo pages
const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  
  return (
    <div className="page">
      <h1>🏠 Home Page</h1>
      <p>Welcome to Flox Router Demo!</p>
      <div className="nav-buttons">
        <button onClick={() => navigate('/about')}>Go to About</button>
        <button onClick={() => navigate('/users/123')}>View User 123</button>
        <button onClick={() => navigate('/protected')}>Protected Page</button>
        <button onClick={() => navigate('/not-found')}>404 Page</button>
      </div>
    </div>
  );
};

const AboutPage: React.FC = () => {
  const { goBack } = useNavigation();
  
  return (
    <div className="page">
      <h1>ℹ️ About Page</h1>
      <p>This is the about page of our Flox Router demo.</p>
      <p>Flox Router provides powerful routing capabilities with:</p>
      <ul>
        <li>✅ URL parameter support</li>
        <li>✅ Navigation history</li>
        <li>✅ Loading states</li>
        <li>✅ Error handling</li>
        <li>✅ Authentication guards</li>
        <li>✅ Role-based access</li>
      </ul>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
};

const UserPage: React.FC = () => {
  const params = useRouteParams();
  const { navigate } = useNavigation();
  
  return (
    <div className="page">
      <h1>👤 User Profile</h1>
      <p>User ID: {params.id}</p>
      <p>This demonstrates URL parameter extraction.</p>
      <div className="nav-buttons">
        <button onClick={() => navigate(`/users/${params.id}/posts`)}>
          View Posts
        </button>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
};

const UserPostsPage: React.FC = () => {
  const params = useRouteParams();
  const { goBack } = useNavigation();
  
  return (
    <div className="page">
      <h1>📝 User Posts</h1>
      <p>Posts for User ID: {params.id}</p>
      <div className="posts">
        <div className="post">
          <h3>Post 1</h3>
          <p>This is the first post by user {params.id}</p>
        </div>
        <div className="post">
          <h3>Post 2</h3>
          <p>This is the second post by user {params.id}</p>
        </div>
      </div>
      <button onClick={goBack}>Back to User</button>
    </div>
  );
};

const ProtectedPage: React.FC = () => {
  const { navigate } = useNavigation();
  
  return (
    <div className="page">
      <h1>🔒 Protected Page</h1>
      <p>This page requires authentication.</p>
      <p>You can see this because authentication is enabled by default in the demo.</p>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

const NotFoundPage: React.FC = () => {
  const { navigate } = useNavigation();
  
  return (
    <div className="page">
      <h1>❌ 404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
};

const LoadingComponent: React.FC = () => (
  <div className="loading">
    <h2>🔄 Loading...</h2>
    <p>Flox Router is initializing...</p>
  </div>
);

const ErrorComponent: React.FC<{ error: string }> = ({ error }) => (
  <div className="error">
    <h2>⚠️ Error</h2>
    <p>{error}</p>
  </div>
);

// Define routes
const routes: Route[] = [
  {
    path: '/',
    component: HomePage,
    meta: {
      title: 'Home - Flox Router Demo'
    }
  },
  {
    path: '/about',
    component: AboutPage,
    meta: {
      title: 'About - Flox Router Demo'
    }
  },
  {
    path: '/users/:id',
    component: UserPage,
    meta: {
      title: 'User Profile - Flox Router Demo'
    }
  },
  {
    path: '/users/:id/posts',
    component: UserPostsPage,
    meta: {
      title: 'User Posts - Flox Router Demo'
    }
  },
  {
    path: '/protected',
    component: ProtectedPage,
    meta: {
      title: 'Protected Page - Flox Router Demo',
      requiresAuth: true
    }
  }
];

// Navigation component
const Navigation: React.FC = () => {
  const { currentRoute, isLoading, error, history } = useRouter();
  
  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link to="/" className="nav-link">🏠 Home</Link>
        <Link to="/about" className="nav-link">ℹ️ About</Link>
        <Link to="/users/123" className="nav-link">👤 User 123</Link>
        <Link to="/protected" className="nav-link">🔒 Protected</Link>
      </div>
      
      <div className="nav-status">
        {isLoading && <span className="status loading">🔄 Loading...</span>}
        {error && <span className="status error">⚠️ {error}</span>}
        {currentRoute && (
          <span className="status current">
            📍 {currentRoute.pathname}
          </span>
        )}
      </div>
      
      <div className="nav-history">
        <h4>Navigation History:</h4>
        <ul>
          {history.slice(-5).map((route, index) => (
            <li key={index}>
              {route.pathname} {route.params.id && `(${route.params.id})`}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

// Main demo component
export const RouterDemo: React.FC = () => {
  return (
    <div className="router-demo">
      <header className="demo-header">
        <h1>🚀 Flox Router Demo</h1>
        <p>Powerful routing system with React integration</p>
      </header>
      
      <Navigation />
      
      <main className="demo-content">
        <Router
          routes={routes}
          loadingComponent={LoadingComponent}
          errorComponent={ErrorComponent}
          fallback={NotFoundPage}
        />
      </main>
      
      <style>{`
        .router-demo {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .demo-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
        }
        
        .demo-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
        }
        
        .demo-header p {
          margin: 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .navigation {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        
        .nav-links {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .nav-link {
          padding: 10px 15px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background 0.3s;
        }
        
        .nav-link:hover {
          background: #0056b3;
        }
        
        .nav-status {
          margin-bottom: 20px;
        }
        
        .status {
          display: inline-block;
          padding: 5px 10px;
          margin-right: 10px;
          border-radius: 5px;
          font-size: 0.9em;
        }
        
        .status.loading {
          background: #fff3cd;
          color: #856404;
        }
        
        .status.error {
          background: #f8d7da;
          color: #721c24;
        }
        
        .status.current {
          background: #d1ecf1;
          color: #0c5460;
        }
        
        .nav-history {
          background: white;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #dee2e6;
        }
        
        .nav-history h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }
        
        .nav-history ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .nav-history li {
          margin-bottom: 5px;
          color: #6c757d;
        }
        
        .demo-content {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .page {
          text-align: center;
        }
        
        .page h1 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .page p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .nav-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .nav-buttons button {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .nav-buttons button:hover {
          background: #218838;
        }
        
        .posts {
          display: grid;
          gap: 20px;
          margin: 20px 0;
        }
        
        .post {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
          border-left: 4px solid #007bff;
        }
        
        .post h3 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .loading, .error {
          text-align: center;
          padding: 50px;
        }
        
        .loading h2, .error h2 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}; 