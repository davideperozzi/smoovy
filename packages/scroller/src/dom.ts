import { EventEmitter } from '@smoovy/emitter';
import { Observable, ObservableConfig, observe, unobserve } from '@smoovy/observer';

export interface ScrollerDomElement {
  container: HTMLElement | Observable;
  wrapper: HTMLElement | Observable;
}

export interface ScrollerDomConfig {
  observer?: Omit<
    ObservableConfig<HTMLElement>, 'target' | 'autoAttach'
  > | false;
  element: HTMLElement | ScrollerDomElement;
}

export enum ScrollerDomEvent {
  RECALC = 'recalc'
}

export class ScrollerDom extends EventEmitter {
  public container: Observable<HTMLElement>;
  public wrapper: Observable<HTMLElement>;
  private dynamic = false;

  public constructor(
    protected config: ScrollerDomConfig
  ) {
    super();

    const observableConfig: Omit<ObservableConfig<HTMLElement>, 'target'> = {
      resizeDetection: true,
      ...config.observer,
      autoAttach: false
    };

    this.dynamic = config.element instanceof HTMLElement;
    this.container = observe(
      this.dynamic
        ? document.createElement('div')
        : (config.element as ScrollerDomElement).container as HTMLElement,
      observableConfig
    );

    this.wrapper = observe(
      this.dynamic
        ? document.createElement('div')
        : (config.element as ScrollerDomElement).wrapper as HTMLElement,
      observableConfig
    );

    if (config.observer !== false) {
      this.wrapper.onDimChange(() => this.emit(ScrollerDomEvent.RECALC));
      this.container.onDimChange(() => this.emit(ScrollerDomEvent.RECALC));
    }

    if (this.dynamic) {
      this.container.ref.classList.add('smoovy-container');
      this.wrapper.ref.classList.add('smoovy-wrapper');
      this.container.ref.appendChild(this.wrapper.ref);
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
    this.wrapper.attach();
    this.container.attach();

    if (this.dynamic) {
      const rootElement = this.config.element as HTMLElement;
      const children = Array.from(rootElement.childNodes);

      rootElement.appendChild(this.container.ref);
      this.wrapper.ref.append(...children);
    }
  }

  public detach() {
    unobserve(this.wrapper);
    unobserve(this.container);

    if (this.dynamic) {
      const rootElement = this.config.element as HTMLElement;
      const children = Array.from(this.wrapper.ref.childNodes);

      rootElement.append(...children);
      rootElement.removeChild(this.container.ref);
    }
  }
}
