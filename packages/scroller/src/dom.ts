import { EventEmitter } from '@smoovy/event';
import {
  defaultControllerConfig, Observable, ObservableController,
  ObservableControllerConfig,
} from '@smoovy/observer';

export interface ScrollerDomElement {
  container: HTMLElement | Observable;
  wrapper: HTMLElement | Observable;
}

export interface ScrollerDomConfig {
  observer?: ObservableControllerConfig | false;
  element: HTMLElement | ScrollerDomElement;
}

export enum ScrollerDomEvent {
  RECALC = 'recalc'
}

export class ScrollerDom extends EventEmitter {
  public container: Observable<HTMLElement>;
  public wrapper: Observable<HTMLElement>;
  public observer: ObservableController;
  private dynamic = false;

  public constructor(
    protected config: ScrollerDomConfig
  ) {
    super();

    this.dynamic = config.element instanceof HTMLElement;

    if (config.observer !== false) {
      this.observer = new ObservableController(
        config.observer || defaultControllerConfig
      );
    }

    this.container = new Observable(this.dynamic
      ? document.createElement('div')
      : (config.element as ScrollerDomElement).container as HTMLElement
    );

    this.wrapper = new Observable(this.dynamic
      ? document.createElement('div')
      : (config.element as ScrollerDomElement).wrapper as HTMLElement
    );

    if (this.observer) {
      this.observer.add(this.container);
      this.observer.add(this.wrapper);

      this.wrapper.onUpdate(() => this.emit(ScrollerDomEvent.RECALC));
      this.container.onUpdate(() => this.emit(ScrollerDomEvent.RECALC));
    }

    if (this.dynamic) {
      this.container.target.className += 'smoovy-container';
      this.wrapper.target.className += 'smoovy-wrapper';

      this.container.target.appendChild(this.wrapper.target);
    }
  }

  public recalc(async = false) {
    if (async) {
      requestAnimationFrame(() => {
        this.wrapper.update();
        this.container.update();
      });
    } else {
      this.wrapper.update();
      this.container.update();
    }
  }

  public attach() {
    if (this.dynamic) {
      const rootElement = this.config.element as HTMLElement;
      const children = Array.from(rootElement.childNodes);

      rootElement.appendChild(this.container.target);
      this.wrapper.target.append(...children);
    }
  }

  public detach() {
    if (this.dynamic) {
      const rootElement = this.config.element as HTMLElement;
      const children = Array.from(this.wrapper.target.childNodes);

      rootElement.append(...children);
      rootElement.removeChild(this.container.target);
    }
  }
}
