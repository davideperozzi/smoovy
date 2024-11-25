import { TimelineItem } from 'packages/tween/src/timeline';

import { EventEmitter } from '@smoovy/emitter';
import { listen, listenCompose, Unlisten } from '@smoovy/listener';
import { Timeline, tween, TweenController } from '@smoovy/tween';
/* eslint-disable lines-between-class-members */
import { BrowserUrl, parseUrl, queryEl } from '@smoovy/utils';

import { Route } from './route';
import { Trigger } from './trigger';
import { createRouteFromPath, parseRouteHtml, routesMatch } from './utils';

export interface RouterConfig {
  /**
   * The outlet is the container that holds the view elements.
   * It will not leave the dom. Only the `view` within it will
   * enter and leave the dom. This is a standard queryselector
   * as you would do with `document.querySelector`.
   *
   * @default 'main'
   */
  outlet?: string;

  /**
   * This is the view within the outlet that will be swapped
   * when navigating. This is a standard queryselector.
   *
   * @default '.router-view'
   */
  view?: string;

  /**
   * The trigger is the element that will trigger the navigation
   * when clicked. This is a standard queryselector.
   *
   * @default 'a[href]:not([data-no-route])'
   */
  trigger?: string;

  /**
   * If set to true, the router will cache the views and will
   * not fetch them again when navigating to the same route.
   *
   * @default true
   */
  cache?: boolean;

  /**
   * Whether to clone the views before they are rendered.
   * This ensures that each view is reset to it's original state.
   * Sometimes you want to keep the state in the cache and don't
   * clone from the original node. You can disable this if you
   * want to preserve the state for each view.
   *
   * @default true
   */
  clone?: boolean;

  /**
   * If set to true, the router will preload the view when
   * hovering over the trigger element.
   *
   * @default true
   */
  hoverPreload?: boolean;

  /**
   * If set to true, the router will force a trailing slash
   * on the url. This is useful for static sites, where the
   * server will redirect to the url with the trailing slash.
   *
   * @default false
   */
  forceTrailingSlash?: boolean;
}

export enum RouterNavResult {
  SUCESS = 1,
  CANCELED = 2,
  ERROR = 4,
  NO_VIEW = 8,
  SAME = 16,
}

export interface RouterEvent {
  fromElement: HTMLElement;
  fromRoute: Route;
  toRoute: Route;
  outlet: HTMLElement;
  trigger: 'user' | 'popstate';
  flags: Record<string, boolean>;
}

export interface RouterSwapEvent extends RouterEvent {
  fromElement: HTMLElement;
  toElement: HTMLElement;
  fromInDom: boolean;
}

export interface RouterChangeState
  extends Omit<RouterSwapEvent, 'fromElement' | 'toElement'>
{
  timeline?: Timeline;
  fromElement?: HTMLElement;
  toElement?: HTMLElement;
}

export interface RouterAnimationHooks {
  start?: (event: RouterEvent) => TweenController | void;
  append?: (event: RouterSwapEvent) => TweenController | void;
  enter?: (event: RouterSwapEvent) => TweenController | void;
  leave?: (event: RouterSwapEvent) => TweenController | void;
  cancel?: (event: RouterEvent) => void;
  release?: (element: HTMLElement) => void;
  complete?: (event: RouterSwapEvent) => void;
}

export interface RouterAnimation extends RouterAnimationHooks {
  name: string;
  when?: (event: RouterEvent) => boolean;
}

export interface RouteToOptions {
  replace?: boolean;
  flags?: Record<string, boolean>;
}

export interface RouteNavigateOptions {
  trigger?: 'user' | 'popstate';
  flags?: Record<string, boolean>;
}

export interface RouterRenderOptions {
  /**
   * Whether to keep the view in the dom after leaving.
   *
   * @default true
   */
  keep?: boolean;

  /**
   * The style to apply to the view element, after it has been appended.
   * They will only be applied if the current route isn't the one that
   * has been rendered. These styles are meant to hide the element from
   * the view, if they don't belong to the current route
   */
  style?: Partial<CSSStyleDeclaration>;
}

export enum RouterEventType {
  TRIGGER_CLICK = 'triggerclick',
  NAV_START = 'navstart',
  NAV_SAME = 'navsame',
  NAV_END = 'navend',
  NAV_CANCEL = 'navcancel',
  NAV_SETTLED = 'navsettled',
  NAV_PROGRESS = 'navprogress',
  ROUTE_PRELOAD = 'routepreload',
  BEFORE_ENTER = 'beforeenter',
  AFTER_ENTER = 'afterenter',
  BEFORE_LEAVE = 'beforeleave',
  AFTER_LEAVE = 'afterleave',
  AFTER_RELEASE = 'afterrelease'
}

interface ViewResult {
  title: string;
  doc?: HTMLElement;
  view?: HTMLElement;
  outlet?: HTMLElement;
}

export class Router extends EventEmitter {
  private abortController?: AbortController;
  private animations: RouterAnimation[] = [];
  private attachedViews = new Map<string, HTMLElement>();
  private _route: Route;
  private _outlet: HTMLElement;
  private _view: HTMLElement;
  private baseUrl: BrowserUrl;
  private trigger: Trigger;
  private unlisten: Unlisten;
  private allowClone = true;
  private changeStates: RouterChangeState[] = [];
  private viewCache = new Map<string, Promise<ViewResult>>();
  private triggerSelector: string;
  private viewSelector: string;
  private outletSelector: string;

  constructor(
    private config: RouterConfig = {}
  ) {
    super();

    this.outletSelector = config.outlet || 'main';
    this.viewSelector = config.view || '.router-view';
    this.triggerSelector = config.trigger || 'a[href]:not([data-no-route])';
    this.allowClone = config.clone !== false;
    this.baseUrl = parseUrl(window.location.href);
    this._route = this.createRoute(this.baseUrl);
    this._outlet = queryEl(this.outletSelector);
    this._view = this.queryView(this._outlet);
    this.unlisten = this.listen();
    this.trigger = new Trigger(this.triggerSelector, (url, target, type) => {
      if (type === 'click') {
        this.emit(RouterEventType.TRIGGER_CLICK, { url, target });
        this.to(url);
      } else if (type === 'hover' && config.hoverPreload !== false) {
        this.preload(url);
      }
    });

    const result: ViewResult = {
      title: document.title,
      outlet: this._outlet,
      view: this._view,
      doc: document.documentElement
    };

    this.viewCache.set(
      this._route.id,
      Promise.resolve(this.allowClone ? this.cloneResult(result) : result)
    );

    if (this._view) {
      this.attachedViews.set(this._route.id, this._view);
    }

    window.history.replaceState(
      this._route,
      '',
      this._route.url + (this._route.hash || '')
    );
  }

  get route() {
    return this._route;
  }

  get outlet() {
    return this._outlet;
  }

  get view() {
    return this._view;
  }

  private listen() {
    return listenCompose(
      listen(window, 'popstate', (event: PopStateEvent) => {
        this.navigate(event.state, { trigger: 'popstate' });
      }),
    );
  }

  update(scope?: HTMLElement) {
    this.trigger.update(scope);
  }

  animate(...animations: RouterAnimation[]) {
    animations.forEach(animation => this.animations.push(animation));
  }

  removeAnimation(name: string) {
    return this.animations.splice(
      this.animations.findIndex(animation => animation.name === name),
      1
    )[0];
  }

  to(route: string | Route, options?: RouteToOptions) {
    route = typeof route == 'string' ? this.createRoute(route) : route;

    this.updateHistory(route, options?.replace)
    this.navigate(route, { flags: options?.flags });

    return this;
  }

  private animateCycle(
    timeline: Timeline,
    animations: RouterAnimation[],
    event: RouterSwapEvent
  ) {
    timeline.call(() => this.emit(RouterEventType.BEFORE_ENTER, event));

    this.animateHook(event, 'append', timeline, animations);

    timeline.call(() => this.attachView(event.toElement, event.toRoute));

    this.animateHook(event, 'enter', timeline, animations);

    timeline.call(() => {
      this.emit(RouterEventType.AFTER_ENTER, event)
      this.emit(RouterEventType.BEFORE_LEAVE, event);
    });

    this.animateHook(event, 'leave', timeline, animations);

    timeline.call(() => {
      this.detachView(event.fromElement, event.fromRoute);
      this.emit(RouterEventType.AFTER_LEAVE, event);
    });
  }

  private animateHook(
    event: RouterSwapEvent,
    hook: keyof RouterAnimationHooks,
    timeline: Timeline,
    animations: RouterAnimationHooks[],
  ): void;
  private animateHook(
    event: RouterEvent,
    hook: keyof RouterAnimationHooks,
    timeline: Timeline,
    animations: RouterAnimationHooks[],
  ): void;
  private animateHook(
    event: any,
    hook: keyof RouterAnimationHooks,
    timeline: Timeline,
    animations: RouterAnimationHooks[],
  ) {
    const timelineItems: TimelineItem[] = [];

    for (const animation of animations) {
      const callback = animation[hook];

      if (callback instanceof Function) {
        timelineItems.push({
          dynamic: () => callback(event) || tween.noop(),
          config: { offset: -1 }
        });
      }
    }

    if (timelineItems.length > 0) {
      timeline.add(() => tween.timeline({ items: timelineItems }));
    }
  }

  async preload(route: Route | string) {
    if (typeof route === 'string') {
      route = this.createRoute(route);
    }

    const result = await this.findView(route);

    this.emit(RouterEventType.ROUTE_PRELOAD, { route, result });

    return result;
  }

  private async navigate(to: Route, options?: RouteNavigateOptions) {
    const trigger = options?.trigger || 'user';
    const event: RouterEvent = {
      outlet: this._outlet,
      fromElement: this.view,
      fromRoute: this._route,
      toRoute: to,
      trigger,
      flags: options?.flags || {}
    };

    if (routesMatch(this._route, to)) {
      this.emit(RouterEventType.NAV_SAME);

      return RouterNavResult.SAME;
    }

    const fromElement = event.fromElement;
    const fromInDom = this._outlet.contains(fromElement);
    const changeState: RouterChangeState = { ...event, fromInDom };
    const animations = this.animations.filter(anim => {
      return anim.when ? anim.when(event) : true
    });

    const timeline = tween.timeline({
      autoStart: false,
      onComplete: () => {
        this.emit(RouterEventType.NAV_SETTLED, event);

        this.changeStates = [];
      },
      onSeek: (progress) => this.emit(RouterEventType.NAV_PROGRESS, progress),
      onStop: (wasRunning) => {
        if (changeState.fromElement) {
          const beingUsed = this.changeStates.some(state => {
            return state.fromElement === changeState.fromElement ||
                   state.toElement === changeState.fromElement
          });

          if ( ! beingUsed) {
            for (const animation of animations) {
              if (animation.release) {
                animation.release(changeState.fromElement);
              }
            }

            this.emit(RouterEventType.AFTER_RELEASE, event);
          }
        }

        requestAnimationFrame(() => {
          if ( ! timeline.complete && wasRunning) {
            this.emit(RouterEventType.NAV_CANCEL, event);

            for (const animation of animations) {
              if (animation.cancel) {
                animation.cancel(event);
              }
            }
          }
        })
      }
    });

    changeState.timeline = timeline;

    this.enableRoute(to);
    this.emit(RouterEventType.NAV_START, event);
    this.animateHook(event, 'start', timeline, animations);

    const { view: toElement, title } = await this.findView(to);

    this.updateTitle(title);

    for (const swapState of this.changeStates) {
      swapState.timeline?.stop();
    }

    this.changeStates.push(changeState);

    if ( ! toElement) {
      return RouterNavResult.NO_VIEW;
    }

    const swapEvent: RouterSwapEvent = { toElement, fromInDom, ...event };

    changeState.fromElement = fromElement;
    changeState.toElement = toElement;

    this.enableView(toElement);
    this.animateCycle(timeline, animations, swapEvent);
    this.trigger.update(toElement);

    for (const animation of animations) {
      if (animation.complete) {
        timeline.call(() => animation.complete?.(swapEvent));
      }
    }

    timeline.call(() => this.emit(RouterEventType.NAV_END, event));
    timeline.start();

    this.clearChangeStates([ fromElement, toElement ], to);

    return RouterNavResult.SUCESS;
  }

  createRoute(path: string | BrowserUrl) {
    const route = createRouteFromPath(path);

    if (this.config.forceTrailingSlash) {
      const trailingSlash = route.url.endsWith('/') ? '' : '/';

      route.url += trailingSlash;
      route.load += trailingSlash;
    }

    return route;
  }

  updateHistory(route: Route, replace = false) {
    window.history[replace ? 'replaceState' : 'pushState'](
      route,
      '',
      route.url + (route.hash || '')
    );

    return this;
  }

  enableView(view: HTMLElement) {
    this._view = view;

    return this;
  }

  enableRoute(route: Route) {
    this._route = route;

    return this;
  }

  updateTitle(title: string) {
    document.title = title;

    return this;
  }

  attachView(view?: HTMLElement, route?: Route) {
    if (view) {
      this._outlet.append(view);

      if (route) {
        this.attachedViews.set(route.id, view);
      }
    }

    return this;
  }

  detachView(view?: HTMLElement, route?: Route) {
    if (view) {
      view.remove();

      if (route) {
        this.attachedViews.delete(route.id);
      }
    }

    return this;
  }

  private clearChangeStates(activeElements: HTMLElement[], route?: Route) {
    for (const changeState of this.changeStates) {
      if ( ! activeElements.includes(changeState.fromElement as HTMLElement)) {
        this.detachView(changeState.fromElement, route);
      }

      if ( ! activeElements.includes(changeState.toElement as HTMLElement)) {
        this.detachView(changeState.toElement, route);
      }
    }
  }

  private queryView(outlet?: HTMLElement) {
    return queryEl(this.viewSelector, outlet);
  }

  private cloneResult(result: ViewResult) {
    const cloned = { ...result };

    if (cloned.doc) {
      cloned.doc = cloned.doc.cloneNode(true) as HTMLElement;
    }

    if (cloned.view) {
      if (cloned.doc) {
        cloned.view = this.queryView(cloned.doc);
      } else {
        cloned.view = cloned.view.cloneNode(true) as HTMLElement;
      }
    }

    return cloned;
  }

  getViewResult(route: Route) {
    return this.viewCache.get(route.id);
  }

  async findView(route: Route) {
    if (this.viewCache.has(route.id) && this.config.cache !== false) {
      const result = await this.viewCache.get(route.id) as ViewResult;

      if (this.attachedViews.has(route.id)) {
        return {
          title: result.title,
          outlet: result.outlet,
          view: this.attachedViews.get(route.id)
        } as ViewResult;
      }

      return this.allowClone
        ? this.cloneResult(result)
        : result;
    }

    const result = this.load(route);

    this.viewCache.set(route.id, result);

    if (this.attachedViews.has(route.id)) {
      return result.then(res => ({
        title: res.title,
        outlet: res.outlet,
        view: this.attachedViews.get(route.id)
      } as ViewResult));
    }

    return this.allowClone
      ? this.cloneResult(await result)
      : await result;
  }

  async load(route: Route): Promise<ViewResult> {
    if (this.abortController) {
      this.abortController.abort();

      this.abortController = new AbortController();
    }

    const abortSignal = this.abortController?.signal;
    const response = await fetch(route.load, { signal: abortSignal });
    const result = parseRouteHtml(await response.text(), this.outletSelector);

    return {
      ...result,
      view: result.outlet ? this.queryView(result.outlet) : undefined
    };
  }

  destroy() {
    this.trigger.clear();
    this.unlisten();
  }
}