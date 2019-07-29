import {
  ElementObserver, ElementObserverConfig, ElementState,
} from '@smoovy/observer';

export enum ScrollerDomClasslist {
  WRAPPER = 'smoovy-wrapper',
  CONTAINER = 'smoovy-container'
}

export interface ScrollerDomConfig {
  observer: false | ElementObserverConfig;
}

export class ScrollerDom {
  public wrapper: ElementState;
  public container: ElementState;
  private observer: ElementObserver;
  private _dynamic = false;
  private updateCbs: (() => void)[] = [];

  public constructor(
    protected root: HTMLElement,
    private containerEl?: HTMLElement,
    private wrapperEl?: HTMLElement,
    private config?: ScrollerDomConfig
  ) {
    const observerConfig = this.config && this.config.observer
      ? this.config.observer
      : {
        mutationThrottle: 100,
        viewportThrottle: 100,
        mutators: [
          {
            target: this.containerEl,
            options: {
              childList: true,
              subtree: true,
              characterData: true
            }
          }
        ]
      };

    this._dynamic = ! containerEl && ! wrapperEl;
    this.containerEl = this.containerEl || document.createElement('div');
    this.wrapperEl = this.wrapperEl || document.createElement('div');

    if (this.config && this.config.observer === false) {
      this.container = new ElementState(this.containerEl);
      this.wrapper = new ElementState(this.wrapperEl);
    } else {
      this.observer = new ElementObserver(observerConfig);
      this.container = this.observer.observe(this.containerEl);
      this.wrapper = this.observer.observe(this.wrapperEl);
    }

    if (this.dynamic) {
      this.wrapper.element.className = ScrollerDomClasslist.WRAPPER;
      this.container.element.className = ScrollerDomClasslist.CONTAINER;
      this.container.element.appendChild(this.wrapper.element);
    }
  }

  public get dynamic() {
    return this._dynamic;
  }

  private update() {
    this.updateCbs.forEach((cb) => cb.call(this));
  }

  public onUpdate(cb: () => void) {
    this.updateCbs.push(cb);
  }

  public create() {
    if (this.dynamic) {
      const children = Array.from(this.root.childNodes);

      this.root.appendChild(this.container.element);
      this.wrapper.element.append(...children);
    }

    this.wrapper.changed(() => this.update());
  }

  public destroy() {
    if (this.dynamic) {
      const children = Array.from(this.wrapper.element.childNodes);

      this.root.append(...children);
      this.root.removeChild(this.container.element);
    }

    this.updateCbs = [];

    this.wrapper.destroy();
  }

  public querySelectorAll(selector: string) {
    return Array.from(this.container.element.querySelectorAll(selector));
  }
}
