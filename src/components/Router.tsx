import React, { useEffect, useState } from 'react';
import { floxRouter, Route } from '../core/Router';


export interface RouterProps {
  routes: Route[];
  fallback?: React.ComponentType<any>;
  loadingComponent?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<any>;
}

export const Router: React.FC<RouterProps> = ({
  routes,
  fallback: FallbackComponent,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to router state
    const currentRouteSub = floxRouter.getCurrentRoute().subscribe(setCurrentRoute);
    const loadingSub = floxRouter.getLoadingState().subscribe(setIsLoading);
    const errorSub = floxRouter.getErrorState().subscribe(setError);

    // Register routes
    floxRouter.registerRoutes(routes);
    setIsInitialized(true);

    return () => {
      currentRouteSub();
      loadingSub();
      errorSub();
    };
  }, [routes]);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>;
  }

  // Show error if there's an error
  if (error) {
    return ErrorComponent ? <ErrorComponent error={error} /> : <div>Error: {error}</div>;
  }

  // Show current route component
  if (currentRoute) {
    const Component = currentRoute.route.component;
    return <Component {...currentRoute.params} />;
  }

  // Show fallback if no route matches
  return FallbackComponent ? <FallbackComponent /> : <div>Page not found</div>;
};

// Navigation components
export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  replace?: boolean;
  state?: any;
  scrollToTop?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  className,
  style,
  replace = false,
  state,
  scrollToTop = true,
  onClick
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (onClick) {
      onClick(event);
    }

    floxRouter.navigate(to, {
      replace,
      state,
      scrollToTop
    });
  };

  return (
    <a href={to} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
};

export interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: any;
  scrollToTop?: boolean;
}

export const Navigate: React.FC<NavigateProps> = ({
  to,
  replace = false,
  state,
  scrollToTop = true
}) => {
  useEffect(() => {
    floxRouter.navigate(to, {
      replace,
      state,
      scrollToTop
    });
  }, [to, replace, state, scrollToTop]);

  return null;
};

// Navigation hooks
export const useRouter = () => {
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const currentRouteSub = floxRouter.getCurrentRoute().subscribe(setCurrentRoute);
    const loadingSub = floxRouter.getLoadingState().subscribe(setIsLoading);
    const errorSub = floxRouter.getErrorState().subscribe(setError);
    const historySub = floxRouter.getHistory().subscribe(setHistory);

    return () => {
      currentRouteSub();
      loadingSub();
      errorSub();
      historySub();
    };
  }, []);

  return {
    currentRoute,
    isLoading,
    error,
    history,
    navigate: floxRouter.navigate.bind(floxRouter),
    goBack: floxRouter.goBack.bind(floxRouter),
    goForward: floxRouter.goForward.bind(floxRouter),
    getState: floxRouter.getState.bind(floxRouter)
  };
};

export const useRouteParams = () => {
  const [currentRoute, setCurrentRoute] = useState<any>(null);

  useEffect(() => {
    const subscription = floxRouter.getCurrentRoute().subscribe(setCurrentRoute);
    return subscription;
  }, []);

  return currentRoute?.params || {};
};

export const useRouteMatch = () => {
  const [currentRoute, setCurrentRoute] = useState<any>(null);

  useEffect(() => {
    const subscription = floxRouter.getCurrentRoute().subscribe(setCurrentRoute);
    return subscription;
  }, []);

  return currentRoute;
};

export const useNavigation = () => {
  return {
    navigate: floxRouter.navigate.bind(floxRouter),
    goBack: floxRouter.goBack.bind(floxRouter),
    goForward: floxRouter.goForward.bind(floxRouter)
  };
}; 