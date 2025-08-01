# 🚀 Flox Router

Sistem router yang powerful dan mudah digunakan untuk Flox state management, mengikuti kaidah web dan React.

## 🎯 Overview

Flox Router menyediakan routing capabilities yang lengkap:
- **URL Parameter Support** - Ekstraksi parameter dari URL
- **Navigation History** - Tracking riwayat navigasi
- **Loading States** - State loading saat navigasi
- **Error Handling** - Penanganan error routing
- **Authentication Guards** - Proteksi route berdasarkan auth
- **Role-based Access** - Kontrol akses berdasarkan role
- **Browser Integration** - Integrasi dengan browser history API

## 🚀 Quick Start

### Basic Setup

```typescript
import { Router, Link, useRouter } from 'flox';

// Define routes
const routes = [
  {
    path: '/',
    component: HomePage,
    meta: { title: 'Home' }
  },
  {
    path: '/users/:id',
    component: UserPage,
    meta: { title: 'User Profile' }
  },
  {
    path: '/protected',
    component: ProtectedPage,
    meta: { 
      title: 'Protected Page',
      requiresAuth: true 
    }
  }
];

// Use in your app
function App() {
  return (
    <Router 
      routes={routes}
      loadingComponent={LoadingSpinner}
      errorComponent={ErrorPage}
    />
  );
}
```

### Navigation Components

```typescript
// Link component
<Link to="/users/123" className="nav-link">
  View User 123
</Link>

// Navigate component (programmatic)
<Navigate to="/dashboard" replace={true} />

// Navigation hooks
function MyComponent() {
  const { navigate, goBack, goForward } = useNavigation();
  const params = useRouteParams();
  const { currentRoute, isLoading } = useRouter();

  return (
    <div>
      <button onClick={() => navigate('/users/123')}>
        Go to User
      </button>
      <button onClick={goBack}>Go Back</button>
      <p>User ID: {params.id}</p>
      {isLoading && <p>Loading...</p>}
    </div>
  );
}
```

## 📚 API Reference

### Route Configuration

```typescript
interface Route {
  path: string;                    // URL path (supports :param and *)
  component: React.ComponentType;  // React component to render
  exact?: boolean;                 // Exact path matching
  children?: Route[];              // Nested routes
  meta?: {
    title?: string;                // Page title
    requiresAuth?: boolean;        // Authentication required
    roles?: string[];              // Required roles
    [key: string]: any;            // Custom metadata
  };
}
```

### Router Component

```typescript
interface RouterProps {
  routes: Route[];                 // Array of routes
  fallback?: React.ComponentType;  // 404 component
  loadingComponent?: React.ComponentType;  // Loading component
  errorComponent?: React.ComponentType;    // Error component
}
```

### Navigation Hooks

#### useRouter()
Returns complete router state and methods:
```typescript
const {
  currentRoute,    // Current route match
  isLoading,       // Loading state
  error,          // Error state
  history,        // Navigation history
  navigate,       // Navigate function
  goBack,         // Go back function
  goForward,      // Go forward function
  getState        // Get router state
} = useRouter();
```

#### useRouteParams()
Returns URL parameters:
```typescript
const params = useRouteParams();
// For /users/123 -> { id: '123' }
```

#### useRouteMatch()
Returns current route match:
```typescript
const match = useRouteMatch();
// { route, params, pathname, search, hash }
```

#### useNavigation()
Returns navigation methods:
```typescript
const { navigate, goBack, goForward } = useNavigation();
```

### Navigation Methods

#### navigate(path, options)
```typescript
await floxRouter.navigate('/users/123', {
  replace: false,      // Replace current history entry
  state: { data: 'value' },  // Navigation state
  scrollToTop: true    // Scroll to top after navigation
});
```

#### goBack()
```typescript
floxRouter.goBack();
```

#### goForward()
```typescript
floxRouter.goForward();
```

## 🔧 Advanced Features

### URL Parameters

```typescript
// Route definition
{ path: '/users/:id/posts/:postId', component: PostPage }

// In component
const params = useRouteParams();
// { id: '123', postId: '456' }
```

### Wildcard Routes

```typescript
// Catch all routes
{ path: '*', component: NotFoundPage }

// Nested wildcards
{ path: '/admin/*', component: AdminLayout }
```

### Authentication Guards

```typescript
const routes = [
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      roles: ['admin', 'user']
    }
  }
];

// Customize authentication check
class CustomRouter extends FloxRouter {
  private async checkAuthentication(): Promise<boolean> {
    return await authService.isAuthenticated();
  }

  private async checkRoles(requiredRoles: string[]): Promise<boolean> {
    const userRoles = await authService.getUserRoles();
    return requiredRoles.some(role => userRoles.includes(role));
  }
}
```

### Navigation State

```typescript
// Pass state during navigation
navigate('/users/123', {
  state: { from: '/dashboard', timestamp: Date.now() }
});

// Access state in component
const { currentRoute } = useRouter();
const navigationState = currentRoute?.state;
```

### Custom Route Matching

```typescript
// Custom route with complex matching
{
  path: '/products/:category/:id',
  component: ProductPage,
  meta: {
    validate: (params) => {
      return params.category && params.id;
    }
  }
}
```

## 🎮 Interactive Demo

Try the **RouterDemo** component to see the router in action:

```typescript
import { RouterDemo } from 'flox';

<RouterDemo />
```

## 🔄 Next Steps

1. **[Advanced Routing](./advanced-routing.md)** - Nested routes, dynamic imports, code splitting
2. **[Authentication](./authentication.md)** - Auth guards, role-based routing
3. **[Performance](./performance.md)** - Route optimization, lazy loading
4. **[Testing](./testing.md)** - Router testing strategies
5. **[Examples](./examples.md)** - Real-world routing examples

---

**Flox Router** - Powerful routing system yang mengikuti kaidah web dan React! 🚀 