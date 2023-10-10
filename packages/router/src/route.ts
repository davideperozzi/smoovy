export interface Route {
  url: string;
  load: string;
  hash?: string;
}

export interface RouteChangeEvent {
  from: Route;
  to: Route;
  error?: any;
  payload?: HTMLDivElement;
  trigger: 'popstate' | 'user';
}
