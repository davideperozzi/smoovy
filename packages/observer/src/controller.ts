import { EventEmitter, listenEl, Unlisten } from '@smoovy/event';
import {
  Browser, Coordinate, getElementOffset, Size, throttle,
} from '@smoovy/utils';

export type ObserveTarget = HTMLElement | Window;

export interface ObservableState {
  offset: Size & Coordinate;
  bounds: Size & Coordinate;
}

export interface Observable {
  target: HTMLElement;
  events: EventEmitter;
  state: ObservableState;
  controller?: ObserveController;
  update: () => void;
}

export interface ObserveControllerConfig {
  throttle?: number;
  mutators?: {
    target?: HTMLElement;
    options?: MutationObserverInit;
  }[];
}

export const defaultConfig: ObserveControllerConfig = {
  throttle: 50,
  mutators: [
    {
      target: Browser.client ? document.documentElement : undefined,
      options: {
        characterData: true,
        childList: true,
        subtree: true
      }
    }
  ]
};

const observableNullState: ObservableState = {
  offset: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { x: 0, y: 0, width: 0, height: 0 },
};

export class ObserveController {
  public static default = new ObserveController();
  private listener: Unlisten;
  private obervables = new Set<Observable>();
  private mutationObserver?: MutationObserver;

  public constructor(
    protected config = defaultConfig
  ) {}

  private attach() {
    const throttleMs = this.config.throttle || 0;
    const updateFn = throttleMs > 0
      ? throttle(this.update.bind(this), throttleMs)
      : this.update.bind(this);

    if (Browser.client && Browser.mutationObserver && this.config.mutators) {
      this.mutationObserver = new MutationObserver(updateFn);

      setTimeout(() => {
        if (Browser.client && this.config.mutators) {
          this.config.mutators.forEach(config => {
            if (config.target && this.mutationObserver) {
              this.mutationObserver.observe(
                config.target,
                { ...config.options  }
              );
            }
          });
        }
      }, throttleMs || 0);
    }

    this.listener = listenEl(window, 'resize', updateFn);
  }

  private detach() {
    if (this.listener) {
      this.listener();
      delete this.listener;
    }
  }

  public update() {
    this.obervables.forEach(observable => {
      requestAnimationFrame(() => {
        this.updateObservable(observable);
      });
    });
  }

  public clear() {
    this.obervables.forEach(observable => this.delete(observable));
  }

  private updateObservable(observable: Observable): ObservableState {
    const target = observable.target;
    const state = observable.state;

    observable.events.emit<ObservableState>('will-update', observable.state);

    if (target instanceof Window) {
      const size = { width: window.innerWidth, height: window.innerHeight };

      state.bounds.width = size.width;
      state.bounds.height = size.height;
      state.offset.width = size.width;
      state.offset.height = size.height;
    } else {
      const bounds = target.getBoundingClientRect();
      const offset = getElementOffset(target);

      state.bounds.x = bounds.left;
      state.bounds.y = bounds.top;
      state.bounds.width = bounds.width;
      state.bounds.height = bounds.height;
      state.offset.x = offset.x;
      state.offset.y = offset.y;
      state.offset.width = target.offsetWidth;
      state.offset.height = target.offsetHeight;
    }

    observable.events.emit<ObservableState>('update', observable.state);

    return state;
  }

  public add(target: ObserveTarget) {
    const observable = {
      target,
      events: new EventEmitter(),
      state: {
        offset: { ...observableNullState.offset },
        bounds: { ...observableNullState.bounds }
    	},
      update: () => {
        if (observable.controller) {
          observable.controller.updateObservable(observable);
        }
      },
      controller: this
    } as Observable;

    this.obervables.add(observable);

    requestAnimationFrame(() => this.updateObservable(observable));

    if ( ! this.listener) {
      this.attach();
    }

    return observable;
  }

  public delete(observable: Observable) {
    const result = this.obervables.delete(observable);

    if (this.obervables.size === 0 && this.listener) {
      this.detach();
    }

    return result;
  }
}
