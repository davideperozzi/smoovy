import {
  ElementObserver, ElementStateImpl, StateChangeListener, StateChangeObservable,
} from '@smoovy/observer';

export enum ScrollerDomClasslist {
  WRAPPER = 'smoovy-wrapper',
  CONTAINER = 'smoovy-container'
}

export class ScrollerDom {
  public wrapper: ElementStateImpl;
  public container: ElementStateImpl;
  private updateCbs: (() => void)[] = [];
  private wrapperObserver?: StateChangeObservable;

  public constructor(
    protected root: HTMLElement,
    private containerEl?: HTMLElement,
    private wrapperEl?: HTMLElement
  ) {
    this.container = ElementObserver.observe(
      this.containerEl || document.createElement('div')
    );

    this.wrapper = ElementObserver.observe(
      this.wrapperEl || document.createElement('div')
    );

    if (this.dynamic) {
      this.wrapper.element.className = ScrollerDomClasslist.WRAPPER;
      this.container.element.className = ScrollerDomClasslist.CONTAINER;
      this.container.element.appendChild(this.wrapper.element);
    }
  }

  protected get dynamic() {
    return ! this.wrapperEl && ! this.containerEl;
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

    this.wrapperObserver = this.wrapper.changed(() => this.update());
  }

  public destroy() {
    if (this.dynamic) {
      const children = Array.from(this.wrapper.element.childNodes);

      this.root.append(...children);
      this.root.removeChild(this.container.element);
    }

    this.updateCbs = [];

    if (this.wrapperObserver) {
      this.wrapperObserver.remove();
      this.wrapperObserver = undefined;
    }
  }

  public querySelectorAll(selector: string) {
    return Array.from(this.container.element.querySelectorAll(selector));
  }
}
