import { listen, listenCompose } from "@smoovy/listener";
import { Observable, observe, unobserve } from "@smoovy/observer";
import { clamp, Coordinate, Size } from "@smoovy/utils";
import { defaults as coreDefaults, Scroller, ScrollerConfig, ScrollerEventType } from "./core";
import { getFocusPosition } from "./utils";

export interface NativeScrollerConfig extends ScrollerConfig {
  /**
   * The container element used as a container.
   * This represents the viewport of the scrollable area.
   * So the content sits inside the container.
   *
   * @default document.body
   */
  container?: HTMLElement | Window;

  /**
   * The wrapper element that contains the content.
   * The scroll limit is defined by the size of the wrapper.
   * All transforms will be set on the wrapper element.
   * If no wrapper element is set, it'll be created dynamically.
   */
  wrapper?: HTMLElement;

  /**
   * Whether to enable focus bypass.
   * This will just scroll to the element that has been focused.
   * This is only enabled while the scroll animation is active.
   * Since we can't use the native "scroll into focus" while it's
   * animating. This preserves the default beahvior while animating..
   *
   * @default true
   */
  focus?: boolean;

  /**
   * If this is enabled, it will just redirect the native scroll events
   * without any smoothing. This makes it easy to disable for mobile,
   * without having too many checks or stuff like:
   *
   * `isMobile() ? window.scrollTo(...) : scroller.scrollTo()`
   *
   * So you can use the same API, which just passes the native
   * events thorugh
   *
   * @default false
   */
  bypass?: boolean;
}

const defaults: NativeScrollerConfig = {
  ...coreDefaults,
  focus: true,
  bypass: false
};

export class NativeScroller<C extends NativeScrollerConfig = NativeScrollerConfig> extends Scroller<C> {
  readonly limit: Size = { width: 0, height: 0 };
  private container!: Observable<HTMLElement | Window>;
  private wrapper!: Observable<HTMLElement>;

  constructor(config: Partial<C> = {}, init = true) {
    super({ ...defaults, ...config }, false);

    if (init) {
      this.init();
    }

    if (this.config.bypass) {
      this.stop();
    }
  }

  update() {
    if (this.container) {
      unobserve(this.container);
    }

    if (this.wrapper) {
      unobserve(this.wrapper);
    }

    const { wrapper, container } = this.config;
    const observableCfg = { resizeDetection: true };

    this.container = observe(container || window, observableCfg);
    this.wrapper = observe(wrapper || document.documentElement, observableCfg);

    this.handleResize();

    if (!this.config.bypass) {
      if (this.container.ref instanceof Window) {
        this.scrollTo({
          x: this.container.ref.scrollX,
          y: this.container.ref.scrollY
        }, true);
      } else {
        this.scrollTo({
          x: this.container.ref.scrollLeft,
          y: this.container.ref.scrollTop
        }, true);
      }
    }

    if (!this.config.inertiaTarget) {
      this.config.inertiaTarget = this.container.ref;
    }

    return super.update();
  }

  listen() {
    return listenCompose(
      super.listen(),
      this.onLock(({ locked }) => this.handleLock(locked)),
      this.container.onDimChange(() => this.handleResize()),
      this.wrapper.onDimChange(() => this.handleResize()),
      listen(this.container.ref, 'scroll', () => this.handleNativeScroll()),
      this.config.focus ?
        listen(this.container.ref, 'focus', (event) => this.handleFocus(event), true)
        : undefined,
    );
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

  protected get viewWidth() {
    return this.container.width;
  }

  protected get viewHeight() {
    return this.container.height;
  }

  protected handleLock(locked: boolean) {
    this.wrapper.ref.style.overflow = locked ? 'hidden' : '';
  }

  protected handleNativeScroll() {
    const bypass = this.config.bypass;

    if (!this.animating || bypass) {
      const container = this.container.ref;
      const isWindow = container instanceof Window;
      const posX = isWindow ? container.scrollX : container.scrollLeft;
      const posY = isWindow ? container.scrollY : container.scrollTop;

      if (bypass) {
        this.setVirtual(posX, posY);
      } else {
        this.virtual.x = this.output.x = posX;
        this.virtual.y = this.output.y = posY;
      }
    }
  }

  protected async handleFocus(event: FocusEvent) {
    if (this.config.bypass) {
      return;
    }

    // in order to get the correct bounding rect, we need to wait for the next frame
    // because when the browser pulls an element into focus it'll try to scroll the
    // container accordinlgy and change the scrollTop/scrollY value. We're resetting
    // it to the actual scroll position, but we need to wait for the next frame so,
    // all the dimensions are recalcuated and for us available to retrieve correctly.
    //
    // We only do this to simulate the default focus behaviour, because it would just
    // skip it due to the animation, so we're calculating it manually here to keep it
    // as accesible as possible.
    if (this.animating) {
      requestAnimationFrame(() => {
        const focus = getFocusPosition(event.target as HTMLElement, this.container);

        if (focus) {
          const { x, y } = this.virtual;

          this.scrollTo({ x: x + focus.x, y: y + focus.y }, true);
        }
      });
    }
  }

  protected handleResize() {
    this.limit.width = Math.max(this.wrapper.scrollWidth - this.container.width, 0);
    this.limit.height = Math.max(this.wrapper.scrollHeight - this.container.height, 0);

    this.emit(ScrollerEventType.RESIZE);
  }

  protected handleScroll(pos = this.output) {
    super.handleScroll(pos);

    if (!this.config.bypass) {
      this.container.ref.scrollTo(this.output.x, this.output.y);
    }
  }

  protected setVirtual(x?: number, y?: number) {
    super.setVirtual(x, y);

    this.virtual.x = clamp(this.virtual.x, 0, this.limit.width);
    this.virtual.y = clamp(this.virtual.y, 0, this.limit.height);

    if (this.config.bypass) {
      this.output.x = this.virtual.x;
      this.output.y = this.virtual.y;

      this.handleScroll();
    }
  }

  protected handleWheel(event: WheelEvent) {
    if (this.config.bypass) {
      return;
    }

    super.handleWheel(event);
  }

  scrollTo(pos: Partial<Coordinate>, jump = false) {
    if (this.config.bypass) {
      this.container.ref.scrollTo(
        typeof pos.x === 'undefined' ? this.output.x : pos.x,
        typeof pos.y === 'undefined' ? this.output.y : pos.y
      );

      return;
    }

    super.scrollTo(pos, jump);
  }
}