import { listenEl, Unlisten } from '@smoovy/event';
import { Browser, throttle } from '@smoovy/utils';
import { Observable, ObservableTarget, ObservableEvent } from './observable';

interface ResizeObserverSize {
  blockSize: number;
  inlineSize: number;
}

interface ResizeObserverEntry {
  borderBoxSize: ResizeObserverSize[];
  contentBoxSize: ResizeObserverSize[];
  contentRect: DOMRectReadOnly;
  devicePixelContentBoxSize: ResizeObserverSize[]
  target: Element;
}

declare class ResizeObserver {
  public constructor(cb: (entries: ResizeObserverEntry[]) => void);
  public observe(target: Element): void;
  public unobserve(target: Element): void;
  public disconnect(): void;
}

export interface ObservableControllerConfig {
  resizeObserver: boolean;
}

/* istanbul ignore next */
export const defaultControllerConfig: ObservableControllerConfig = {
  resizeObserver: true
};

export class ObservableController {
  public static readonly default = new ObservableController();
  private unlistenResize?: Unlisten;
  private resizeObserver?: ResizeObserver;
  private obervables = new Set<Observable>();

  public constructor(
    protected config = defaultControllerConfig
  ) {}

  private attach() {
    /* istanbul ignore next: covered by pptr */
    if (
      this.config.resizeObserver &&
      Browser.client &&
      Browser.resizeObserver
    ) {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          this.obervables.forEach(observable => {
            if (observable.target === entry.target) {
              observable.update();
            }
          });
        });
      });
    }

    // update window observables
    this.unlistenResize = listenEl(window, 'resize', () => {
      this.obervables.forEach(observable => {
        if (observable.target instanceof Window) {
          observable.update();
        }
      });
    });
  }

  private detach() {
    /* istanbul ignore else */
    if (this.unlistenResize) {
      this.unlistenResize();
      delete this.unlistenResize;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      delete this.resizeObserver;
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

    /* istanbul ignore else */
    if ( ! this.unlistenResize) {
      this.attach();
    }

    const observable = target instanceof Observable
      ? target as Exclude<O, ObservableTarget>
      : new Observable<Exclude<O, Observable>>(target as any);

    if (this.resizeObserver && observable.target instanceof Element) {
      this.resizeObserver.observe(observable.target);
    }

    (observable as Observable).emit(ObservableEvent.WILL_ATTACH, observable);
    this.obervables.add(observable);
    (observable as Observable).emit(ObservableEvent.ATTACH, observable);

    requestAnimationFrame(() => observable.update());

    return observable;
  }

  public delete(observable: Observable) {
    if ( ! this.obervables.has(observable)) {
      throw new Error('Observable was not added to this controller');
    }

    if (this.resizeObserver && observable.target instanceof Element) {
      this.resizeObserver.unobserve(observable.target);
    }

    observable.emit(ObservableEvent.WILL_DETACH, observable);
    this.obervables.delete(observable);
    observable.emit(ObservableEvent.DETACH, observable);

    /* istanbul ignore else */
    if (this.obervables.size === 0 && this.unlistenResize) {
      this.detach();
    }
  }
}
