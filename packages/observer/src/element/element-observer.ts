import { Browser, throttle } from '@smoovy/utils';

import { ViewportObservable, ViewportObserver } from '../viewport-observer';
import { ElementState } from './element-state';

export interface ElementObserverMutator {
  target?: HTMLElement;
  options?: MutationObserverInit;
}

export interface ElementObserverConfig {
  mutationThrottle?: number;
  viewportThrottle?: number;
  mutators?: ElementObserverMutator[];
}

const defaultConfig: ElementObserverConfig = {
  mutationThrottle: 100,
  viewportThrottle: 100,
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

export class ElementObserver {
  public static default = new ElementObserver(defaultConfig);
  private lastRaf: number;
  private attached = false;
  private viewportObserver?: ViewportObservable;
  private mutationObserver?: MutationObserver;
  private states: ElementState[] = [];

  public constructor(
    private config: ElementObserverConfig
  ) {}

  public static observe(element: HTMLElement) {
    return this.default.observe(element);
  }

  public observe(element: HTMLElement) {
    for (let i = 0, len = this.states.length; i < len; i++) {
      if (this.states[i].element === element) {
        return this.states[i];
      }
    }

    return this.register(new ElementState(element));
  }

  private register(state: ElementState) {
    this.states.push(state);
    this.checkStates();

    state.update(true);
    state.onDestroy(() => this.deregister(state));

    return state;
  }

  private deregister(state: ElementState) {
    const index = this.states.indexOf(state);

    if (index > -1) {
      this.states.splice(index, 1);
      this.checkStates();
    }

    if ( ! state.destroyed) {
      state.destroy();
    }
  }

  public updateRaf() {
    if (Browser.client) {
      cancelAnimationFrame(this.lastRaf);

      this.lastRaf = requestAnimationFrame(() => this.update());
    } else {
      this.update();
    }
  }

  public update(async = false) {
    for (let i = 0, len = this.states.length; i < len; i++) {
      this.states[i].update(async);
    }
  }

  private attach() {
    this.attached = true;
    this.viewportObserver = ViewportObserver.changed(
      typeof this.config.viewportThrottle === 'number'
        ? throttle(() => this.update(), this.config.viewportThrottle)
        : () => this.update()
    );

    if (Browser.client && Browser.mutationObserver && this.config.mutators) {
      const throttleMs = this.config.mutationThrottle;

      this.mutationObserver = new MutationObserver(
        typeof throttleMs === 'number'
          ? throttle(() => this.updateRaf(), throttleMs)
          : () => this.updateRaf()
      );

      this.config.mutators.forEach(config => {
        if (config.target && this.mutationObserver) {
          this.mutationObserver.observe(config.target, { ...config.options  });
        }
      });
    }

    let domContentLoadedListener: EventListenerOrEventListenerObject;

    if (Browser.client) {
      document.addEventListener(
        'DOMContentLoaded',
        domContentLoadedListener = () => {
          this.updateRaf();

          document.removeEventListener(
            'DOMContentLoaded',
            domContentLoadedListener
          );
        },
        false
      );
    }

    this.updateRaf();
  }

  private detach() {
    this.attached = false;

    if (this.viewportObserver) {
      this.viewportObserver.remove();
      this.viewportObserver = undefined;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
  }

  private checkStates() {
    if (this.states.length > 0 && ! this.attached) {
      this.attach();
    }

    if (this.states.length === 0 && this.attached) {
      this.detach();
    }
  }
}
