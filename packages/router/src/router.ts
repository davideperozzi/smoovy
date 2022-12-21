import { EventEmitter } from '@smoovy/emitter';
import { listen, Unlisten } from '@smoovy/listener';
import {
  BrowserUrl, GoFetch, goFetch, parseUrl, serializeUrl,
} from '@smoovy/utils';

import { RouterOutlet } from './outlet';
import { RouterTransition } from './transition';

export interface Route {
  url: string;
  load: string;
}

export interface RouterState {
  current?: Route;
}

export interface RouteChangeEvent {
  from: Route;
  to: Route;
  error?: any;
  payload?: HTMLDivElement;
  trigger: 'popstate' | 'user';
}

export interface NavigateConfig {
  outlet?: boolean;
  history?: boolean;
  trigger?: RouteChangeEvent['trigger'];
}

export enum RouterEvent {
  INIT = 'init',
  NAVIGATION_START = 'navigationstart',
  NAVIGATION_END = 'navigationend',
  NAVIGATION_CANCEL = 'navigationcancel',
  CONTENT_LOAD_START = 'contentloadstart',
  CONTENT_LOAD_END = 'contentloadend',
  CONTENT_LOAD_CANCEL = 'contentloadcancel',
  CONTENT_LOAD_ERROR = 'contentloaderror'
}

export interface RouterConfig {
  outlet?: string | RouterOutlet;
  transitions?: (RouterTransition | [ RouterTransition, string[] ])[];
}

export class Router extends EventEmitter {
  public outlet?: RouterOutlet;
  private baseUrl: BrowserUrl;
  private _state: RouterState = {};
  private fetch?: GoFetch;
  private pendingEvent?: RouteChangeEvent;
  private unlistenPopstate?: Unlisten;
  private contentCache = new Map<string, string>();
  private transitions = new Map<string, RouterTransition[]>();

  public constructor(
    baseUrl: string | BrowserUrl,
    config?: RouterConfig
  ) {
    super();

    if (typeof baseUrl === 'string') {
      this.baseUrl = parseUrl(baseUrl);
    } else {
      this.baseUrl = baseUrl as BrowserUrl;
    }

    if (config && config.outlet) {
      if ( ! (config.outlet instanceof RouterOutlet)) {
        this.outlet = new RouterOutlet(config.outlet);
      } else {
        this.outlet = config.outlet;
      }
    }

    if (config && config.transitions) {
      config.transitions.forEach(transition => {
        if (transition instanceof Array) {
          this.addTransition(transition[0], transition[1]);
        } else {
          this.addTransition(transition);
        }
      });
    }

    this.init();
  }

  private init() {
    const route = {
      url: `${this.baseUrl.pathname}${this.baseUrl.search}${this.baseUrl.hash}`,
      load: serializeUrl(this.baseUrl)
    };

    this.replace(route, true);
    this.emit(RouterEvent.INIT, route);

    this.unlistenPopstate = listen(
      window,
      'popstate',
      (event) => {
        this.navigate(event.state, { history: false, trigger: 'popstate' });
      }
    );
  }

  public destroy() {
    if (this.unlistenPopstate) {
      this.unlistenPopstate();
      delete this.unlistenPopstate;
    }
  }

  public addTransition(
    transition: RouterTransition,
    constraints: string[] = [ '.* => .*' ]
  ) {
    constraints.forEach(constraint => {
      if (this.transitions.has(constraint)) {
        const transitions = this.transitions.get(constraint);

        if (transitions && ! transitions.includes(transition)) {
          transitions.push(transition);
        }
      } else {
        this.transitions.set(constraint, [ transition ]);
      }
    });
  }

  public removeTransition(...transitions: RouterTransition[]) {
    const emptyConstraints: string[] = [];

    transitions.forEach(transition => {
      this.transitions.forEach((currentTransitions, constraint) => {
        const index = currentTransitions.indexOf(transition);

        if (index > -1) {
          currentTransitions.splice(index, 1);
        }

        if (currentTransitions.length === 0) {
          emptyConstraints.push(constraint);
        }
      });
    });

    emptyConstraints.forEach(constr => this.transitions.delete(constr));
  }

  public replace(route: Route | string, history = false) {
    if (typeof route === 'string') {
      route = this.routeFromUrl(route);
    }

    this._state.current = route;

    if (history) {
      window.history.replaceState(route, '', route.url);
    }
  }

  public push(route: Route | string, history = false) {
    if (typeof route === 'string') {
      route = this.routeFromUrl(route);
    }

    this._state.current = route;

    if (history) {
      window.history.pushState(route, '', route.url);
    }
  }

  private parseContent(html: string) {
    const parser = document.createElement('div');

    parser.innerHTML = html;

    return parser;
  }

  public prepareContent(html: string) {
    const element = this.parseContent(html);
    const titleEl = element.querySelector('title');

    return {
      element,
      title: titleEl && titleEl.textContent
    };
  }

  private async loadContent(event: RouteChangeEvent) {
    if (this.fetch) {
      if  (this.fetch.controller) {
        this.fetch.controller.abort();
      }

      this.emit<RouteChangeEvent>(RouterEvent.CONTENT_LOAD_CANCEL);
    }

    this.emit<RouteChangeEvent>(
      RouterEvent.CONTENT_LOAD_START,
      {
        ...event
      }
    );

    await this.preload(event.to).catch((error) => {
      this.emit<RouteChangeEvent>(
        RouterEvent.CONTENT_LOAD_ERROR,
        {
          ...event,
          error
        }
      );
    });

    const content = this.contentCache.get(event.to.load);

    if (content) {
      const prepared = this.prepareContent(content);

      if (prepared.title) {
        document.title = prepared.title;
      }

      this.emit<RouteChangeEvent>(
        RouterEvent.CONTENT_LOAD_END,
        {
          ...event,
          payload: prepared.element,
        }
      );

      if (this.outlet) {
        const transitions: RouterTransition[] = [];

        this.transitions.forEach((trans, pattern) => {
          const parts = pattern.split('=>');
          const fromPattern = new RegExp(`^${parts[0].trim()}$`, 'gi');
          const toPattern = new RegExp(`^${parts[1].trim()}$`, 'gi');

          if (
            fromPattern.test(event.from.url) &&
            toPattern.test(event.to.url)
          ) {
            transitions.push(...trans);
          }
        });

        await this.outlet.update(prepared.element, transitions, event.trigger);
      }
    }
  }

  public get state() {
    return Object.freeze({ ...this._state });
  }

  private routeFromUrl(loadUrl: string) {
    const url = parseUrl(loadUrl);

    return {
      url: `${url.pathname}${url.search}${url.hash}`,
      load: loadUrl,
    } as Route;
  }

  public async preload(route: Route | string) {
    if (typeof route === 'string') {
      route = this.routeFromUrl(route);
    }

    if ( ! this.contentCache.has(route.load)) {
      this.fetch = goFetch(route.load);

      const content = await this.fetch.then((result) => result.text());

      if (content) {
        this.contentCache.set(route.load, content);

        return content;
      }
    }

    return this.contentCache.get(route.load);
  }

  public async navigate(
    toRoute: Route | string,
    config: NavigateConfig = {}
  ) {
    const fromRoute = this._state.current;
    const useHistory = typeof config.history === 'undefined'
      ? true
      : config.history;

    if (typeof toRoute === 'string') {
      toRoute = this.routeFromUrl(toRoute);
    }

    if ( ! fromRoute) {
      throw new Error('No initial route found!');
    }

    if (this._state.current && this._state.current.url === toRoute.url) {
      return;
    }

    if (this.pendingEvent) {
      this.emit<RouteChangeEvent>(
        RouterEvent.NAVIGATION_CANCEL,
        this.pendingEvent
      );
    }

    this.pendingEvent = {
      from: fromRoute,
      to: toRoute,
      trigger: config.trigger || 'user'
    };

    this.emit<RouteChangeEvent>(
      RouterEvent.NAVIGATION_START,
      this.pendingEvent
    );

    this.push(toRoute, useHistory);
    await this.loadContent(this.pendingEvent);
    this.emit<RouteChangeEvent>(RouterEvent.NAVIGATION_END, this.pendingEvent);
    delete this.pendingEvent;
  }
}
