import { listenEl, Unlisten } from '@smoovy/event';
import { Browser, throttle } from '@smoovy/utils';
import { Observable, ObservableTarget, ObservableEvent } from './observable';

export interface ObserveControllerConfig {
  throttle?: number;
  mutators?: {
    target?: HTMLElement;
    options?: MutationObserverInit;
  }[];
}

export const defaultConfig: ObserveControllerConfig = {
  throttle: 50,
  mutators: Browser.client ? [
    {
      target: document.documentElement,
      options: {
        characterData: true,
        childList: true,
        subtree: true
      }
    }
  ] : []
};

export class ObservableController {
  public static readonly default = new ObservableController();
  private listener: Unlisten;
  private obervables = new Set<Observable>();
  private mutationObserver?: MutationObserver;

  public constructor(
    protected config = defaultConfig
  ) {}

  private attach() {
    const throttleMs = this.config.throttle || 0;
    const updateFn = throttleMs > 0
      ? throttle(this.update.bind(this, false), throttleMs)
      : this.update.bind(this, false);

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

  public update(async = true) {
    this.obervables.forEach(observable => {
      if (async) {
        requestAnimationFrame(() => observable.update());
      } else {
        observable.update();
      }
    });
  }

  public reset() {
    this.obervables.forEach(observable => this.delete(observable));
  }

  public get active() {
    return this.obervables.size > 0;
  }

  public add(target: ObservableTarget | Observable) {
    if ( ! target) {
      throw new Error('Invalid element to observe');
    }

    const observable = new Observable(
      target instanceof Observable
        ? target.target
        : target
    );

    observable.emit(ObservableEvent.WILL_ATTACH);
    this.obervables.add(observable);
    observable.emit(ObservableEvent.ATTACH);
    requestAnimationFrame(() => observable.update());

    if ( ! this.listener) {
      this.attach();
    }

    return observable;
  }

  public delete(observable: Observable) {
    if (this.obervables.has(observable)) {
      observable.emit(ObservableEvent.WILL_DETACH);
    }

    const result = this.obervables.delete(observable);

    if (result) {
      observable.emit(ObservableEvent.DETACH);
    }

    if (this.obervables.size === 0 && this.listener) {
      this.detach();
    }

    return result;
  }
}
