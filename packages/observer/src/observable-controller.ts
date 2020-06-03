import { listenEl, Unlisten } from '@smoovy/event';
import { Browser, throttle } from '@smoovy/utils';
import { Observable, ObservableTarget, ObservableEvent } from './observable';

export interface ObservableControllerConfig {
  throttle: number;
  mutators?: {
    target?: HTMLElement;
    options?: MutationObserverInit;
  }[];
}

/* istanbul ignore next */
export const defaultControllerConfig: ObservableControllerConfig = {
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
    protected config = defaultControllerConfig
  ) {}

  private attach() {
    const throttleMs = this.config.throttle;
    const updateFn = /* istanbul ignore else */ throttleMs > 0
      ? throttle(this.update.bind(this, false), throttleMs)
      : /* istanbul ignore next */ this.update.bind(this, false);

    /* istanbul ignore next: covered by pptr */
    if (Browser.client && Browser.mutationObserver && this.config.mutators) {
      this.mutationObserver = new MutationObserver(updateFn);

      setTimeout(() => {
        if (Browser.client && this.config.mutators) {
          this.config.mutators.forEach(config => {
            if (config.target && this.mutationObserver) {
              this.mutationObserver.observe(
                config.target,
                { ...config.options }
              );
            }
          });
        }
      }, throttleMs || 0);
    }

    this.listener = listenEl(window, 'resize', updateFn);
  }

  private detach() {
    /* istanbul ignore else */
    if (this.listener) {
      this.listener();
      delete this.listener;
    }

    /* istanbul ignore next */
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      delete this.mutationObserver;
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

  public add<O extends ObservableTarget | Observable>(target: O) {
    /* istanbul ignore else */
    if (typeof target !== 'object') {
      throw new Error(`Invalid target to observe (${target})`);
    }

    const observable = target instanceof Observable
      ? target as Exclude<O, ObservableTarget>
      : new Observable<Exclude<O, Observable>>(target as any);

    (observable as Observable).emit(ObservableEvent.WILL_ATTACH, observable);
    this.obervables.add(observable);
    (observable as Observable).emit(ObservableEvent.ATTACH, observable);

    requestAnimationFrame(() => observable.update());

    /* istanbul ignore else */
    if ( ! this.listener) {
      this.attach();
    }

    return observable;
  }

  public delete(observable: Observable) {
    if ( ! this.obervables.has(observable)) {
      throw new Error('Observable was not added to this controller');
    }

    observable.emit(ObservableEvent.WILL_DETACH, observable);
    this.obervables.delete(observable);
    observable.emit(ObservableEvent.DETACH, observable);

    /* istanbul ignore else */
    if (this.obervables.size === 0 && this.listener) {
      this.detach();
    }
  }
}
