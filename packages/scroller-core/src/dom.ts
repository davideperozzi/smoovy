import { ElementObserver, ElementStateImpl } from '@smoovy/observer';

export enum ScrollerDomClasslist {
  WRAPPER = 'smoovy-wrapper',
  CONTAINER = 'smoovy-container'
}

export class ScrollerDom {
  public wrapper: ElementStateImpl;
  public container: ElementStateImpl;
  private updateCbs: (() => void)[] = [];

  public constructor(protected root: HTMLElement) {
    this.container = ElementObserver.observe(document.createElement('div'));
    this.wrapper = ElementObserver.observe(document.createElement('div'));

    this.container.element.className = ScrollerDomClasslist.CONTAINER;
    this.wrapper.element.className = ScrollerDomClasslist.WRAPPER;

    this.container.element.appendChild(this.wrapper.element);
    this.wrapper.changed(() => this.update());
  }

  private update() {
    this.updateCbs.forEach((cb) => cb.call(this));
  }

  public onUpdate(cb: () => void) {
    this.updateCbs.push(cb);
  }

  public create() {
    const children = Array.from(this.root.childNodes);

    this.root.appendChild(this.container.element);
    this.wrapper.element.append(...children);
  }

  public destroy() {
    const children = Array.from(this.wrapper.element.childNodes);

    this.root.append(...children);
    this.root.removeChild(this.container.element);

    this.updateCbs = [];
  }

  public querySelectorAll(selector: string) {
    return Array.from(this.container.element.querySelectorAll(selector));
  }
}
