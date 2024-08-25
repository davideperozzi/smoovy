import { listen, listenCompose } from '@smoovy/listener';
import { Observable, observe, unobserve } from '@smoovy/observer';
import { clamp, Size } from '@smoovy/utils';
import { Scroller, ScrollerConfig, defaults as coreDefaults, ScrollerEventType } from './core';
import { getFocusPosition } from './utils';

export interface ElementScrollerConfig extends ScrollerConfig {
  /**
   * The container element used as a container.
   * This represents the viewport of the scrollable area.
   * So the content sits inside the container.
   *
   * @default document.body
   */
  container?: HTMLElement;

  /**
   * The wrapper element that contains the content.
   * The scroll limit is defined by the size of the wrapper.
   * All transforms will be set on the wrapper element.
   * If no wrapper element is set, it'll be created dynamically.
   */
  wrapper?: HTMLElement;

  /**
   * Whether to enable focus bypass.
   * This will just scroll to the element that has been focused
   *
   * @default true
   */
  focus?: boolean;

  /**
   * Styles set on the container element
   *
   * @default { width: '100%', height: '100%', overflow: 'hidden' }
   */
  styles?: Partial<CSSStyleDeclaration>;
}

const defaults: ElementScrollerConfig = {
  ...coreDefaults,
  focus: true,
  styles: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  }
};

export class ElementScroller<C extends ElementScrollerConfig = ElementScrollerConfig> extends Scroller<C> {
  readonly limit: Size = { width: 0, height: 0 };
  private container!: Observable<HTMLElement>;
  private wrapper!: Observable<HTMLElement>;

  constructor(config: Partial<C> = {}, init = true) {
    super({ ...defaults, ...config }, false);

    if (init) {
      this.init();
    }
  }

  update() {
    if (this.container) {
      unobserve(this.container);
    }

    if (this.wrapper) {
      unobserve(this.wrapper);
    }

    const { wrapper, container, styles } = this.config;
    const observableCfg = { resizeDetection: true };

    this.container = observe(container || document.body, observableCfg);

    if (this.container.ref instanceof Window) {
      throw new Error('container can\'t be the window');
    }

    if (wrapper) {
      this.wrapper = observe(wrapper, observableCfg);
    } else {
      const dynamicWrapper = document.createElement('div');
      const children = Array.from(this.container.ref.childNodes);

      this.container.ref.appendChild(dynamicWrapper);
      dynamicWrapper.append(...children);

      this.wrapper = observe(dynamicWrapper, observableCfg);
    }

    if (styles) {
      for (const name in styles) {
        this.container.ref.style[name] = styles[name]!;
      }
    }

    this.handleResize();
    setTimeout(() => this.resetNativeScroll(), 10);

    if ( ! this.config.inertiaTarget) {
      this.config.inertiaTarget = this.container.ref;
    }

    return super.update();
  }

  destroy() {
    super.destroy();

    if (this.container) {
      unobserve(this.container);
    }

    if (this.wrapper) {
      unobserve(this.wrapper);
    }
  }

  listen() {
    const containerEl = this.container.ref;

    return listenCompose(
      super.listen(),
      this.container.onDimChange(() => this.handleResize()),
      this.wrapper.onDimChange(() => this.handleResize()),
      this.config.focus ?
        listen(containerEl, 'focus', (event) => this.handleFocus(event), true)
        : undefined,
      listen(containerEl, 'scroll', (event: Event) => {
        event.preventDefault();
        this.resetNativeScroll();
      }),
    );
  }

  protected resetNativeScroll() {
    const containerEl = this.container.ref;
    const wrapperEl = this.wrapper.ref;
    const parentEl = containerEl.parentElement;

    containerEl.scrollLeft = containerEl.scrollTop = 0;
    wrapperEl.scrollLeft = wrapperEl.scrollTop = 0;

    if (parentEl) {
      parentEl.scrollLeft = parentEl.scrollTop = 0;
    }
  }

  protected async handleFocus(event: FocusEvent) {
    this.resetNativeScroll();

    // in order to get the correct bounding rect, we need to wait for the next frame
    // because when the browser pulls an element into focus it'll try to scroll the
    // container accordinlgy and change the scrollTop value. We're resetting it to 0,
    // but we need to wait for the next frame so, all the dimensions are recalcuated
    // and for us available to retrieve correctly
    requestAnimationFrame(() => {
      const focus = getFocusPosition(event.target as HTMLElement, this.container);

      if (focus) {
        this.addVirtual(focus.x, focus.y);
      }
    });
  }

  protected setVirtual(x?: number, y?: number) {
    super.setVirtual(x, y);

    this.virtual.x = clamp(this.virtual.x, 0, this.limit.width);
    this.virtual.y = clamp(this.virtual.y, 0, this.limit.height);
  }

  protected get wheelTarget() {
    return this.config.wheelTarget || this.container.ref || window;
  }

  protected get viewWidth() {
    return this.container.width;
  }

  protected get viewHeight() {
    return this.container.height;
  }

  protected handleResize() {
    this.limit.width = this.wrapper.width - this.container.width;
    this.limit.height = this.wrapper.height - this.container.height;

    this.emit(ScrollerEventType.RESIZE);
  }

  protected handleScroll(pos = this.output) {
    super.handleScroll(pos);

    this.wrapper.ref.style.transform = `translate3d(${-pos.x}px, ${-pos.y}px, 0)`;
  }
}