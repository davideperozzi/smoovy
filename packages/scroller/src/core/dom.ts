import { Size } from '@smoovy/utils';

export enum ScrollerDomClasslist {
  WRAPPER = 'smoovy-wrapper',
  CONTAINER = 'smoovy-container'
}

export class ScrollerDom {
  public wrapper: HTMLElement;
  public container: HTMLElement;
  private mutations?: MutationObserver;
  private updateCbs: (() => void)[] = [];

  public constructor(
    protected root: HTMLElement,
    observeDom: boolean
  ) {
    this.container = document.createElement('div');
    this.wrapper = document.createElement('div');

    this.container.className = ScrollerDomClasslist.CONTAINER;
    this.wrapper.className = ScrollerDomClasslist.WRAPPER;

    this.container.appendChild(this.wrapper);

    if (observeDom) {
      this.mutations = new MutationObserver((mutations) => {
        this.update();
      });
    }
  }

  private update() {
    this.updateCbs.forEach((cb) => cb.call(this));
  }

  public onUpdate(cb: () => void) {
    this.updateCbs.push(cb);
  }

  public create() {
    const children = Array.from(this.root.childNodes);

    this.root.appendChild(this.container);
    this.wrapper.append(...children);

    if (this.mutations) {
      this.mutations.observe(
        this.container,
        {
          characterData: true,
          childList: true,
          subtree: true
        }
      );
    }
  }

  public destroy() {
    const children = Array.from(this.wrapper.childNodes);

    this.root.append(...children);
    this.root.removeChild(this.container);

    if (this.mutations) {
      this.mutations.disconnect();
    }

    this.updateCbs = [];
  }

  public getWrapperSize(): Size {
    const { width, height } = this.wrapper.getBoundingClientRect();

    return { width, height };
  }

  public getContainerSize(): Size {
    const { width, height } = this.container.getBoundingClientRect();

    return { width, height };
  }

  public querySelectorAll(selector: string) {
    return Array.from(this.container.querySelectorAll(selector));
  }
}
