import { Subject } from './Subject';


export interface Route {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  children?: Route[];
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    [key: string]: any;
  };
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  pathname: string;
  search: string;
  hash: string;
}

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
  scrollToTop?: boolean;
}

export interface RouterState {
  currentRoute: RouteMatch | null;
  history: RouteMatch[];
  isLoading: boolean;
  error: string | null;
}

export class FloxRouter {
  private static instance: FloxRouter;
  private routes: Route[] = [];
  private currentRoute = new Subject<RouteMatch | null>(null);
  private history = new Subject<RouteMatch[]>([]);
  private isLoading = new Subject<boolean>(false);
  private error = new Subject<string | null>(null);
  private navigationInProgress = false;

  // Browser history integration
  private originalPushState!: typeof history.pushState;
  private originalReplaceState!: typeof history.replaceState;
  private originalPopState!: (event: PopStateEvent) => void;

  private constructor() {
    this.setupBrowserIntegration();
  }

  static getInstance(): FloxRouter {
    if (!FloxRouter.instance) {
      FloxRouter.instance = new FloxRouter();
    }
    return FloxRouter.instance;
  }

  /**
   * Setup browser history integration
   */
  private setupBrowserIntegration(): void {
    // Store original methods
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;

    // Override pushState
    history.pushState = (data: any, title: string, url?: string | URL) => {
      this.originalPushState.call(history, data, title, url);
      if (url) {
        this.handleUrlChange(url.toString());
      }
    };

    // Override replaceState
    history.replaceState = (data: any, title: string, url?: string | URL) => {
      this.originalReplaceState.call(history, data, title, url);
      if (url) {
        this.handleUrlChange(url.toString());
      }
    };

    // Handle popstate events
    this.originalPopState = () => {
      this.handleUrlChange(window.location.href);
    };
    window.addEventListener('popstate', this.originalPopState);

    // Handle initial route
    this.handleUrlChange(window.location.href);
  }

  /**
   * Register routes
   */
  registerRoutes(routes: Route[]): void {
    this.routes = routes;
    this.handleUrlChange(window.location.href);
  }

  /**
   * Add a single route
   */
  addRoute(route: Route): void {
    this.routes.push(route);
    this.handleUrlChange(window.location.href);
  }

  /**
   * Remove a route by path
   */
  removeRoute(path: string): void {
    this.routes = this.routes.filter(route => route.path !== path);
  }

  /**
   * Navigate to a new route
   */
  async navigate(path: string, options: NavigationOptions = {}): Promise<void> {
    if (this.navigationInProgress) {
      console.warn('Navigation already in progress, skipping...');
      return;
    }

    this.navigationInProgress = true;
    this.isLoading.next(true);
    this.error.next(null);

    try {
      const url = new URL(path, window.location.origin);
      const match = this.findRouteMatch(url.pathname);

      if (!match) {
        throw new Error(`Route not found: ${path}`);
      }

      // Check authentication if required
      if (match.route.meta?.requiresAuth) {
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) {
          throw new Error('Authentication required');
        }
      }

      // Check roles if specified
      if (match.route.meta?.roles) {
        const hasRole = await this.checkRoles(match.route.meta.roles);
        if (!hasRole) {
          throw new Error('Insufficient permissions');
        }
      }

      // Update browser history
      if (options.replace) {
        history.replaceState(options.state || {}, '', url.toString());
      } else {
        history.pushState(options.state || {}, '', url.toString());
      }

      // Update current route
      this.currentRoute.next(match);

      // Add to history
      const currentHistory = this.history.value;
      this.history.next([...currentHistory, match]);

      // Scroll to top if requested
      if (options.scrollToTop !== false) {
        window.scrollTo(0, 0);
      }

      // Update document title
      if (match.route.meta?.title) {
        document.title = match.route.meta.title;
      }

    } catch (error) {
      this.error.next(error instanceof Error ? error.message : 'Navigation failed');
      console.error('Navigation error:', error);
    } finally {
      this.isLoading.next(false);
      this.navigationInProgress = false;
    }
  }

  /**
   * Navigate back
   */
  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  /**
   * Navigate forward
   */
  goForward(): void {
    window.history.forward();
  }

  /**
   * Get current route
   */
  getCurrentRoute(): Subject<RouteMatch | null> {
    return this.currentRoute;
  }

  /**
   * Get navigation history
   */
  getHistory(): Subject<RouteMatch[]> {
    return this.history;
  }

  /**
   * Get loading state
   */
  getLoadingState(): Subject<boolean> {
    return this.isLoading;
  }

  /**
   * Get error state
   */
  getErrorState(): Subject<string | null> {
    return this.error;
  }

  /**
   * Get router state
   */
  getState(): RouterState {
    return {
      currentRoute: this.currentRoute.value,
      history: this.history.value,
      isLoading: this.isLoading.value,
      error: this.error.value
    };
  }

  /**
   * Find route match for pathname
   */
  private findRouteMatch(pathname: string): RouteMatch | null {
    for (const route of this.routes) {
      const match = this.matchRoute(route, pathname);
      if (match) {
        return match;
      }
    }
    return null;
  }

  /**
   * Match a single route against pathname
   */
  private matchRoute(route: Route, pathname: string): RouteMatch | null {
    const pattern = this.pathToRegex(route.path);
    const match = pathname.match(pattern);

    if (!match) {
      return null;
    }

    const params: Record<string, string> = {};
    const paramNames = this.extractParamNames(route.path);

    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return {
      route,
      params,
      pathname,
      search: window.location.search,
      hash: window.location.hash
    };
  }

  /**
   * Convert path pattern to regex
   */
  private pathToRegex(path: string): RegExp {
    const pattern = path
      .replace(/:[^/]+/g, '([^/]+)') // Convert :param to capture group
      .replace(/\*/g, '.*'); // Convert * to wildcard

    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract parameter names from path
   */
  private extractParamNames(path: string): string[] {
    const matches = path.match(/:[^/]+/g);
    return matches ? matches.map(match => match.slice(1)) : [];
  }

  /**
   * Handle URL changes
   */
  private handleUrlChange(url: string): void {
    const urlObj = new URL(url);
    const match = this.findRouteMatch(urlObj.pathname);

    if (match) {
      this.currentRoute.next(match);
    } else {
      // Handle 404
      this.error.next('Page not found');
    }
  }

  /**
   * Check authentication (to be implemented by user)
   */
  private async checkAuthentication(): Promise<boolean> {
    // Default implementation - override in your app
    return true;
  }

  /**
   * Check user roles (to be implemented by user)
   */
  private async checkRoles(_requiredRoles: string[]): Promise<boolean> {
    // Default implementation - override in your app
    return true;
  }

  /**
   * Cleanup router
   */
  dispose(): void {
    // Restore original browser methods
    history.pushState = this.originalPushState;
    history.replaceState = this.originalReplaceState;
    window.removeEventListener('popstate', this.originalPopState);

    // Clear subjects
    this.currentRoute.dispose();
    this.history.dispose();
    this.isLoading.dispose();
    this.error.dispose();
  }
}

// Export singleton instance
export const floxRouter = FloxRouter.getInstance(); 