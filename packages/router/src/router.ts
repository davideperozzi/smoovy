import { EventEmitter, listenEl, Unlisten } from '@smoovy/event';
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

export enum RouterEvent {
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
  private state: RouterState = {};
  private fetch?: GoFetch;
  private pendingEvent?: RouteChangeEvent;
  private unlistenPopstate: Unlisten;
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
    this.replace({
      url: `${this.baseUrl.pathname}${this.baseUrl.search}${this.baseUrl.hash}`,
      load: serializeUrl(this.baseUrl)
    }, true);

    this.unlistenPopstate = listenEl(
      window,
      'popstate',
      (event: PopStateEvent) => {
        this.navigate(event.state, false, 'popstate');
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

  private replace(route: Route, history = false) {
    this.state.current = route;

    if (history) {
      window.history.replaceState(route, '', route.url);
    }
  }

  private push(route: Route, history = false) {
    this.state.current = route;

    if (history) {
      window.history.pushState(route, '', route.url);
    }
  }

  private parseContent(html: string) {
    const parser = document.createElement('div');

    parser.innerHTML = html;

    return parser;
  }

  private async loadContent(event: RouteChangeEvent) {
    if (this.fetch) {
      this.fetch.controller.abort();
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
      const payload = this.parseContent(content);
      const titleEl = payload.querySelector('title');

      if (titleEl && titleEl.textContent) {
        document.title = titleEl.textContent;
      }

      this.emit<RouteChangeEvent>(
        RouterEvent.CONTENT_LOAD_END,
        {
          ...event,
          payload,
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

        await this.outlet.update(payload, transitions, event.trigger);
      }
    }
  }

  public async preload(route: Route) {
    if ( ! this.contentCache.has(route.load)) {
      this.fetch = goFetch(route.load);

      const content = await this.fetch.then((result) => result.text());

      if (content) {
        this.contentCache.set(route.load, content);
      }
    }
  }

  public async navigate(
    toRoute: Route | string,
    history = true,
    trigger: RouteChangeEvent['trigger'] = 'user'
  ) {
    const fromRoute = this.state.current;

    if (typeof toRoute === 'string') {
      const url = parseUrl(toRoute);

      toRoute = {
        url: `${url.pathname}${url.search}${url.hash}`,
        load: toRoute,
      };
    }

    if ( ! fromRoute) {
      throw new Error('No initial route found!');
    }

    if (this.state.current && this.state.current.url === toRoute.url) {
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
      trigger
    };

    this.emit<RouteChangeEvent>(
      RouterEvent.NAVIGATION_START,
      this.pendingEvent
    );

    this.push(toRoute, history);
    await this.loadContent(this.pendingEvent);
    this.emit<RouteChangeEvent>(RouterEvent.NAVIGATION_END, this.pendingEvent);
    delete this.pendingEvent;
  }
}
