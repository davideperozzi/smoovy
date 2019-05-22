import { Size } from '@smoovy/utils';

export enum ScrollerDomClasslist {
  WRAPPER = 'smoovy-wrapper',
  CONTAINER = 'smoovy-container'
}

export class ScrollerDom {
  public wrapper: HTMLElement;
  public container: HTMLElement;

  public constructor(
    protected root: HTMLElement
  ) {
    this.container = document.createElement('div');
    this.wrapper = document.createElement('div');

    this.container.className = ScrollerDomClasslist.CONTAINER;
    this.wrapper.className = ScrollerDomClasslist.WRAPPER;

    this.container.appendChild(this.wrapper);
  }

  public create() {
    const children = Array.from(this.root.children);

    this.root.appendChild(this.container);
    children.forEach(child => this.wrapper.appendChild(child));
  }

  public destroy() {
    const children = Array.from(this.wrapper.children);

    children.forEach(child => this.root.appendChild(child));
    this.root.removeChild(this.container);
  }

  public getWrapperSize(): Size {
    const { width, height } = this.wrapper.getBoundingClientRect();

    return { width, height };
  }

  public getContainerSize(): Size {
    const { width, height } = this.container.getBoundingClientRect();

    return { width, height };
  }
}
