import { throttle } from '@smoovy/utils/m/throttle';
import { Resolver } from '@smoovy/utils/m/resolver';
import { Browser } from '@smoovy/utils/m/browser';

export type ViewportChangeListener = (state: ViewportState) => void;

export interface ViewportState {
  width: number;
  height: number;
}

export interface ViewportObservable {
  remove: () => void;
}

export class ViewportObserver {
  private static _listening = false;
  private static _state: ViewportState = { width: 0, height: 0 };
  private static lastRafId: number = -1;
  private static resizeListener?: EventListenerOrEventListenerObject;
  private static listeners: ViewportChangeListener[] = [];
  private static stateResolver = new Resolver<ViewportState>();

  public static changed(
    listener: ViewportChangeListener,
    throttleTime: number = 0
  ): ViewportObservable {
    if (throttleTime > 0) {
      listener = throttle(listener, throttleTime);
    }

    this.listeners.push(listener);
    this.checkListeners();

    return {
      remove: () => this.removeListener(listener),
    };
  }

  private static removeListener(listener: ViewportChangeListener) {
    const index = this.listeners.indexOf(listener);

    if (index > -1) {
      this.listeners.splice(index, 1);
      this.checkListeners();
    }
  }

  private static checkListeners() {
    this.listening = this.listeners.length > 0;
  }

  private static set listening(listening: boolean) {
    if (listening && ! this._listening) {
      this.attach();
    } else if ( ! listening && this._listening) {
      this.detach();
    }

    this._listening = listening;
  }

  public static get state() {
    return this.stateResolver.promise;
  }

  public static update(
    force: boolean = false,
    silent: boolean = false
  ) {
    if (Browser.client) {
      this._state.width = window.innerWidth;
      this._state.height = window.innerHeight;
    }

    if ( ! this.stateResolver.completed) {
      this.stateResolver.resolve(this._state);
    }

    if ( ! silent) {
      this.handleResize(force);
    }
  }

  private static getStateSum() {
    return this._state.width + this._state.height;
  }

  private static handleResize(force: boolean = false)  {
    cancelAnimationFrame(this.lastRafId);

    const prevSum = this.getStateSum();

    this.lastRafId = requestAnimationFrame(() => {
      this.update();

      if (prevSum !== this.getStateSum() || true === force) {
        for (let i = 0, len = this.listeners.length; i < len; i++) {
          this.listeners[i].call(this, this._state);
        }
      }
    });
  }

  private static attach() {
    if ( ! this.resizeListener ) {
      this.handleResize();
      this.resizeListener = () => this.handleResize();

      if (Browser.client) {
        window.addEventListener('resize', this.resizeListener, true);
      }
    }
  }

  private static detach() {
    if (this.resizeListener) {
      if (Browser.client) {
        window.removeEventListener('resize', this.resizeListener, true);
      }

      this.resizeListener = undefined;
    }
  }
}
