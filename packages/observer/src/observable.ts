import { EventEmitter } from '@smoovy/emitter';
import { listenCompose } from '@smoovy/listener';

export type ObservableTarget = HTMLElement | Window;

export interface ObservableConfig<
  T extends ObservableTarget = ObservableTarget
> {
  target: T;
  useBounds?: boolean;
  visibilityDetection?: boolean | IntersectionObserverInit;
  visibilityDelay?: number;
  detectVisibilityOnce?: boolean;
  resizeDetection?: boolean | ResizeObserverOptions;
  resizeDebounce?: number;
}

export enum ObservableEventType {
  VISIBILITY_CHANGE = 'visibilitychange',
  DIMENSIONS_CHANGE = 'dimensionschange'
}

export type ObservableChangeListener = (observable: Observable) => any;

export function observe<T extends ObservableTarget>(
  target: T,
  config?: Omit<ObservableConfig<T>, 'target'>
) {
  return new Observable({ target, ...(config || {}) });
}

export function unobserve<T extends ObservableTarget>(
observable: Observable<T>
) {
  observable.destroy();
}

export class Observable<
  T extends ObservableTarget = HTMLElement
> extends EventEmitter {
  public static readonly items = new Map<ObservableTarget, Observable<any>[]>();
  private static intersecObservers = new Map<string, IntersectionObserver>();
  private static resizeObserver?: ResizeObserver;
  private intersecObserver?: IntersectionObserver;
  private lastResize = 0;
  private visibilityTimer = -1;
  private _left = 0;
  private _top = 0;
  private _width = 0;
  private _height = 0;
  private _visible = false;

  private static handleEntries<E extends { target: Element }>(
    entries: E[],
    cb: (observable: Observable, entry: E) => void
  ) {
    entries.forEach(entry => {
      const observables = Observable.items.get(entry.target as HTMLElement);

      if (observables) {
        for (let i = 0, len = observables.length; i < len; i++) {
          cb(observables[i], entry);
        }
      }
    });
  }

  constructor(
    private config: ObservableConfig<T>
  ) {
    super();

    if (
      ! (config.target instanceof HTMLElement) &&
      ! (config.target instanceof Window)
    ) {
      throw new Error('target type is not valid: ' + typeof config.target);
    }

    if (Observable.items.has(config.target)) {
      Observable.items.get(config.target)?.push(this);
    } else {
      Observable.items.set(config.target, [this]);
    }

    if (config.visibilityDetection && config.target instanceof HTMLElement) {
      const observers = Observable.intersecObservers;
      const observerConfig: IntersectionObserverInit = {
        ...(typeof config.visibilityDetection === 'object'
          ? config.visibilityDetection
          : {}
        )
      };

      const observerKey = this.getIdFromConfig(observerConfig);

      if ( ! observers.has(observerKey)) {
        observers.set(observerKey, new IntersectionObserver((entries) => {
          Observable.handleEntries<IntersectionObserverEntry>(
            entries,
            (observable, entry) => {
              observable.visible = entry.isIntersecting;
            }
          );
        }, observerConfig));
      }

      this.intersecObserver = observers.get(observerKey);

      this.intersecObserver?.observe(config.target);
    }

    if (config.resizeDetection) {
      if ( ! Observable.resizeObserver) {
        Observable.resizeObserver = new ResizeObserver((entries) => {
          Observable.handleEntries<ResizeObserverEntry>(
            entries,
            (observable) => observable.update()
          );
        });

        if (window) {
          window.addEventListener('resize', () => {
            Observable.items.forEach(observables => {
              for (let i = 0, len = observables.length; i < len; i++) {
                const observable = observables[i];

                if (observable?.resizeDetection) {
                  requestAnimationFrame(() => observable.update());
                }
              }
            })
          });
        }
      }

      if (config.target instanceof HTMLElement) {
        Observable.resizeObserver.observe(config.target, {
          ...(typeof config.resizeDetection === 'object'
            ? config.resizeDetection
            : {}
          )
        });
      }
    }

    requestAnimationFrame(() => this.update());
  }

  get resizeDebounce() {
    return this.config.resizeDebounce || 16.6;
  }

  get resizeDetection() {
    return this.config.resizeDetection;
  }

  get visibilityDelay() {
    return this.config.visibilityDelay || 0;
  }

  get visibilityThreshold() {
    return typeof this.config.visibilityDetection === 'object'
      ? this.config.visibilityDetection.threshold || 0
      : 0;
  }

  get ref() {
    return this.config.target;
  }

  get visible() {
    return this._visible
  }

  set visible(visible: boolean) {
    if (visible !== this._visible) {
      clearTimeout(this.visibilityTimer);

      if (this.visibilityDelay > 0) {
        this.visibilityTimer = setTimeout(
          () => this.emitVisibility(visible),
          this.visibilityDelay
        ) as any;
      } else {
        this.emitVisibility(visible);
      }
    }
  }

  get left() {
    return this._left;
  }

  get top() {
    return this._top;
  }

  get x() {
    return this._left;
  }

  get y() {
    return this._top;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  onDimChange(listener: ObservableChangeListener) {
    return this.on(ObservableEventType.DIMENSIONS_CHANGE, listener);
  }

  onVisChange(listener: ObservableChangeListener) {
    return this.on(ObservableEventType.VISIBILITY_CHANGE, listener);
  }

  onChange(listener: ObservableChangeListener) {
    return listenCompose(
      this.onDimChange(listener),
      this.onVisChange(listener)
    );
  }

  update() {
    const now = window.performance.now();
    let rect;

    if (now - this.lastResize <= this.resizeDebounce) {
      return;
    }

    this.lastResize = now;

    if (this.ref instanceof Window) {
      rect = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    } else {
      if (this.config.useBounds !== false) {
        rect = this.getElementOffset(this.ref);
      } else {
        rect = this.ref.getBoundingClientRect();
      }
    }

    if (
      rect.left !== this._left || rect.top !== this._top ||
      rect.width !== this._width || rect.height !== this._height
    ) {
      this._left = rect.left;
      this._top = rect.top;
      this._width = rect.width;
      this._height = rect.width;

      this.emit(ObservableEventType.DIMENSIONS_CHANGE, this);
    }
  }

  destroy() {
    const observables = Observable.items.get(this.ref);

    if (observables) {
      const index = observables.indexOf(this);

      if (index > -1) {
        observables.splice(index, 1);
      }

      if (this.ref instanceof HTMLElement) {
        this.intersecObserver?.unobserve(this.ref);
        Observable.resizeObserver?.unobserve(this.ref);
      }

      if (observables.length === 0) {
        Observable.items.delete(this.ref);
      }
    }
  }

  private emitVisibility(visible: boolean) {
    this._visible = visible;

    if (visible && this.intersecObserver && this.config.detectVisibilityOnce) {
      this.intersecObserver.unobserve(this.ref as HTMLElement);
    }

    this.emit(ObservableEventType.VISIBILITY_CHANGE, this);
  }

  private getIdFromConfig<C>(config: C) {
    return JSON.stringify(config);
  }

  private getElementOffset(element: HTMLElement) {
    let left = 0;
    let top = 0;
    let parent = element;

    do {
      left += parent.offsetLeft || 0;
      top += parent.offsetTop || 0;
      parent = parent.offsetParent as HTMLElement;
    } while (parent);

    return {
      left,
      top,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  }
}