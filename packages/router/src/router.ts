/* eslint-disable lines-between-class-members */
import { BrowserUrl, parseUrl, queryEl } from "@smoovy/utils";
import { Unlisten, listen, listenCompose } from "@smoovy/listener";
import { Trigger } from "./trigger";
import { createRouteFromPath, parseRouteHtml, routesMatch } from "./utils";
import { Route } from "./route";
import { Timeline, tween, TweenController } from "@smoovy/tween";
import { EventEmitter } from "@smoovy/emitter";

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
  trigger: 'user' | 'popstate';
}

export interface RouterSwapEvent extends RouterEvent {
  fromElement: HTMLElement;
  toElement: HTMLElement;
}

export interface RouterChangeState
  extends Omit<RouterSwapEvent, 'fromElement' | 'toElement'>
{
  timeline: Timeline;
  fromElement?: HTMLElement;
  toElement?: HTMLElement;
}

export interface RouterAnimationHooks {
  navStart?: (event: RouterEvent) => TweenController | void;
  navCancel?: (event: RouterEvent) => void;
  navEnd?: (event: RouterSwapEvent) => void;
  beforeEnter?: (event: RouterSwapEvent) => TweenController;
  afterEnter?: (event: RouterSwapEvent) => TweenController;
  beforeLeave?: (event: RouterSwapEvent) => TweenController;
  afterLeave?: (event: RouterSwapEvent) => TweenController;
  afterRelease?: (element: HTMLElement) => void;
}

export interface RouterAnimation extends RouterAnimationHooks {
  name: string;
  when?: (event: RouterEvent) => boolean;
}

export enum RouterEventType {
  TRIGGER_CLICK = 'triggerclick',
  NAV_START = 'navstart',
  NAV_END = 'navend',
  NAV_CANCEL = 'navcancel',
  NAV_SETTLED = 'navsettled',
  NAV_PROGRESS = 'navprogress',
  BEFORE_ENTER = 'beforeenter',
  AFTER_ENTER = 'afterenter',
  BEFORE_LEAVE = 'beforeleave',
  AFTER_LEAVE = 'afterleave',
  AFTER_RELEASE = 'afterrelease'
}

export class Router extends EventEmitter {
  private abortController?: AbortController;
  private animations: RouterAnimation[] = [];
  private outlet: HTMLElement;
  private view: HTMLElement;
  private route: Route;
  private baseUrl: BrowserUrl;
  private trigger: Trigger;
  private unlisten: Unlisten;
  private changeStates: RouterChangeState[] = [];
  private viewCache = new Map<string, HTMLElement>();
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
    this.baseUrl = parseUrl(window.location.href);
    this.route = createRouteFromPath(this.baseUrl);
    this.outlet = queryEl(this.outletSelector);
    this.view = this.queryView(this.outlet);
    this.unlisten = this.listen();
    this.trigger = new Trigger(this.triggerSelector, (url, target) => {
      this.emit(RouterEventType.TRIGGER_CLICK, { url, target });
      this.to(url);
    });

    this.viewCache.set(this.route.id, this.view);
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

  to(url: string, options?: { replace?: boolean }) {
    const route = createRouteFromPath(url);
    const method = options?.replace ? 'replaceState' : 'pushState';

    window.history[method](route, '', route.url + (route.hash || ''));
    this.navigate(route);
  }

  private animateCycle(
    timeline: Timeline,
    animations: RouterAnimation[],
    event: RouterSwapEvent
  ) {
    if ( ! document.documentElement.contains(event.toElement)) {
      this.animateHook(event, 'beforeEnter', timeline, animations);
      timeline.call(() => this.emit(RouterEventType.BEFORE_ENTER, event));

      timeline.call(() => this.outlet.append(event.toElement));

      this.animateHook(event, 'afterEnter', timeline, animations);
      timeline.call(() => this.emit(RouterEventType.AFTER_ENTER, event));
    }

    this.animateHook(event, 'beforeLeave', timeline, animations);
    timeline.call(() => this.emit(RouterEventType.BEFORE_LEAVE, event));

    timeline.call(() => event.fromElement.remove());

    this.animateHook(event, 'afterLeave', timeline, animations);
    timeline.call(() => this.emit(RouterEventType.AFTER_LEAVE, event));
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
    const controllers: TweenController[] = [];

    for (const animation of animations) {
      const callback = animation[hook];

      if (callback instanceof Function) {
        const controller = callback(event);

        if (controller instanceof TweenController) {
          controllers.push(controller);
        }
      }
    }

    timeline.add(controllers);
  }

  async navigate(to: Route, options?: { trigger?: 'user' | 'popstate' }) {
    if ( ! to) {
      return;
    }

    const trigger = options?.trigger || 'user';
    const event: RouterEvent = {
      fromElement: this.view,
      fromRoute: this.route,
      toRoute: to,
      trigger
    };

    if (routesMatch(this.route, to)) {
      return RouterNavResult.SAME;
    }

    const fromElement = event.fromElement;
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
          for (const animation of animations) {
            if (animation.afterRelease) {
              animation.afterRelease(changeState.fromElement);
            }
          }

          this.emit(RouterEventType.AFTER_RELEASE, event);
        }

        requestAnimationFrame(() => {
          if ( ! timeline.complete && wasRunning) {
            this.emit(RouterEventType.NAV_CANCEL, event);

            for (const animation of animations) {
              if (animation.navCancel) {
                animation.navCancel(event);
              }
            }
          }
        })
      }
    });

    this.emit(RouterEventType.NAV_START, event);
    this.animateHook(event, 'navStart', timeline, animations);

    const toElement = await this.findView(to);
    const changeState: RouterChangeState = { timeline, ...event };

    for (const swapState of this.changeStates) {
      swapState.timeline.stop();
    }

    this.changeStates.push(changeState);

    this.route = to;

    if ( ! toElement) {
      return RouterNavResult.NO_VIEW;
    }

    const swapEvent: RouterSwapEvent = { toElement, ...event };

    changeState.fromElement = fromElement;
    changeState.toElement = toElement;

    this.view = toElement;

    this.animateCycle(timeline, animations, swapEvent);
    this.trigger.update(toElement);

    for (const animation of animations) {
      if (animation.navEnd) {
        timeline.call(() => animation.navEnd?.(swapEvent));
      }
    }

    timeline.call(() => this.emit(RouterEventType.NAV_END, event));
    timeline.start();

    this.clearChangeStates([ fromElement, toElement ]);

    return RouterNavResult.SUCESS;
  }

  private clearChangeStates(activeElements: HTMLElement[]) {
    for (const changeState of this.changeStates) {
      if ( ! activeElements.includes(changeState.fromElement as HTMLElement)) {
        if (changeState.fromElement) {
          changeState.fromElement.remove();
        }
      }

      if ( ! activeElements.includes(changeState.toElement as HTMLElement)) {
        if (changeState.toElement) {
          changeState.toElement.remove();
        }
      }
    }
  }

  private queryView(outlet: HTMLElement) {
    return queryEl(this.viewSelector, outlet);
  }

  async findView(route: Route) {
    if (this.viewCache.has(route.id) && this.config.cache !== false) {
      return this.viewCache.get(route.id) as HTMLElement;
    } else {
      try {
        const { outlet } = await this.load(route);

        if (outlet) {
          const view = this.queryView(outlet);

          this.viewCache.set(route.id, view);

          return view;
        }
      } catch(err) {
        console.warn(`Something went wrong when fetching route`, err);
      }
    }
  }

  async load(route: Route) {
    if (this.abortController) {
      this.abortController.abort();

      this.abortController = new AbortController();
    }

    const response = await fetch(route.load, {
      signal: this.abortController?.signal
    });

    return parseRouteHtml(await response.text(), this.outletSelector);
  }

  destroy() {
    this.trigger.clear();
    this.unlisten();
  }
}