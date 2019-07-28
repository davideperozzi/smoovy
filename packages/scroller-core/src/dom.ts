import { ElementObserver, ElementState } from '@smoovy/observer';

export enum ScrollerDomClasslist {
  WRAPPER = 'smoovy-wrapper',
  CONTAINER = 'smoovy-container'
}

export class ScrollerDom {
  public wrapper: ElementState;
  public container: ElementState;
  private observer: ElementObserver;
  private updateCbs: (() => void)[] = [];

  public constructor(
    protected root: HTMLElement,
    private containerEl?: HTMLElement,
    private wrapperEl?: HTMLElement
  ) {

    this.containerEl = this.containerEl || document.createElement('div');
    this.wrapperEl = this.wrapperEl || document.createElement('div');
    this.observer = new ElementObserver({
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
    });

    this.container = this.observer.observe(this.containerEl);
    this.wrapper = this.observer.observe(this.wrapperEl);

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
