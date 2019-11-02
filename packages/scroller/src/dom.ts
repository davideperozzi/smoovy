import { EventEmitter } from '@smoovy/event';
import {
  ElementObserver, ElementObserverConfig, ElementState,
} from '@smoovy/observer';

export interface ScrollerDomElement {
  container: HTMLElement | ElementState;
  wrapper: HTMLElement | ElementState;
}

export interface ScrollerDomConfig {
  observer?: ElementObserverConfig | false;
  element: HTMLElement | ScrollerDomElement;
}

export enum ScrollerDomEvent {
  RECALC = 'recalc'
}

export class ScrollerDom extends EventEmitter {
  public container: ElementState;
  public wrapper: ElementState;
  public observer: ElementObserver;
  private dynamic = false;

  public constructor(protected config: ScrollerDomConfig) {
    super();

    this.dynamic = config.element instanceof HTMLElement;

    if (config.observer !== false) {
      this.observer = new ElementObserver(config.observer);
    }

    this.container = new ElementState(this.dynamic
      ? document.createElement('div')
      : (config.element as ScrollerDomElement).container
    );

    this.wrapper = new ElementState(this.dynamic
      ? document.createElement('div')
      : (config.element as ScrollerDomElement).wrapper
    );

    if (this.observer) {
      this.container = this.observer.observe(this.container);
      this.wrapper = this.observer.observe(this.wrapper);

      this.wrapper.changed(() => this.emit(ScrollerDomEvent.RECALC));
      this.container.changed(() => this.emit(ScrollerDomEvent.RECALC));
    }

    if (this.dynamic) {
      this.container.element.className += 'smoovy-container';
      this.wrapper.element.className += 'smoovy-wrapper';

      this.container.element.appendChild(this.wrapper.element);
    }
  }

  public recalc(async = false) {
    this.wrapper.update(async);
    this.container.update(async);
  }

  public attach() {
    if (this.dynamic) {
      const rootElement = this.config.element as HTMLElement;
      const children = Array.from(rootElement.childNodes);

      rootElement.appendChild(this.container.element);
      this.wrapper.element.append(...children);
    }
  }

  public detach() {
    if (this.dynamic) {
      const rootElement = this.config.element as HTMLElement;
      const children = Array.from(this.wrapper.element.childNodes);

      rootElement.append(...children);
      rootElement.removeChild(this.container.element);
    }
  }
}
