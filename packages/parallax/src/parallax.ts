import { Observable, observe, unobserve } from '@smoovy/observer';
import { between, clamp, Coordinate, isFunc } from '@smoovy/utils';

import { ParallaxResolver } from './resolver';
import { createState, ParallaxState } from './state';

export interface ParallaxElementConfig {
  target: HTMLElement;
  transform?: boolean;
}

export interface ParallaxConfig {
  /**
   * Context to tell tell which updates to
   * listen to and which state to use
   *
   * @default default
   */
  context?: string;

  /**
   * Whether to enable "out-of-viewport" detection and stop updating
   * once the coordinates aren't visible to the user anymore
   *
   * @default true
   */
  culling?: boolean;

  /**
   * This enabled a special mode where the parallax item moves inside a
   * container. Usually an element with `overflow: hidden`. This applies
   * a scale to the item, so it won't show a gap when the user scrolls
   * by this item. It's as simple as: 1 + (gap * 2) / size. If there's
   * an element available it will be transformed.
   *
   * @default false
   */
  masking?: boolean;

  /**
   * Whether to normalize the shift value. If this is enabled, a value
   * for compensating starting and ending positions will be added to the
   * shift value. So if you have an item at the first section of your
   * viewport the starting position will be adjusted, so the shift will
   * be 0 if the scroll position is 0.
   *
   * @default true
   */
  normalize?: boolean;

  /**
   * The speed tells how fast the item should move in relation to the
   * scroll position. The initial position will always be reached when
   * the center position of the item and the viewport match. This means
   * if the item is in the center of the viewport the shift is 0.
   * A speed value of 0 means no shift, 1 means basicall fixed and everthing
   * in between, below and above will generate parallax effect
   *
   * @default { x: 0, y: 0 }
   */
  speed?: Partial<Coordinate>;

  /**
   * This will be used as a target, so the shift will be applied as
   * translate3d and the mask (if enabled) with `scale`
   *
   * @default null
   */
  element?: HTMLElement | ParallaxElementConfig;

  /**
   * Determines the clamp mode of the element. This can be useful as an
   * alternative to css-sticky, in cases where you need more flexibility.
   * Hovever it's recommended to use "position: sticky" wherever possible.
   *
   * Note: clamping ignores paddings and margins int the parent container.
   * If you want to have spacings, you need to wrap the parent container
   * accordingly. This is to simplify the position calculations
   *
   * 'parent' -> It uses the parent box to termine, how far to move the pos
   */
  clamp?: 'parent' | false;

  /**
   * Simply notifies you about the current state of the item and only will
   * be triggered if the item position has changed. You can make modifications
   * to the state here. For example remap the y value to x so it moves
   * horizontally when the user scrolls vertically
   */
  onUpdate?: (state: ParallaxState, progress: Coordinate) => void;
}

export function parallax(config: ParallaxConfig) {
  return new Parallax(config);
}

interface ParallaxLock {
  ctx: string;
  scope?: HTMLElement;
}

export class Parallax {
  private static registry = new Map<string, Parallax[]>();
  private static locks: ParallaxLock[] = [];
  protected target?: Observable<HTMLElement>;
  protected parent?: Observable<HTMLElement>;
  protected resolvers: Coordinate<ParallaxResolver>;
  protected state = createState();

  constructor(
    protected config: ParallaxConfig
  ) {
    const entries = Parallax.registry.get(this.context);

    this.resolvers = {
      x: new ParallaxResolver(config),
      y: new ParallaxResolver(config)
    };

    if (entries) {
      entries.push(this);
    } else {
      Parallax.registry.set(this.context, [this]);
    }

    if (config.element) {
      const element = config.element instanceof HTMLElement
        ? config.element
        : config.element.target;

      this.target = observe(element, {
        resizeDetection: true,
        visibilityDetection: true
      });

      if ((config.masking || config.clamp == 'parent') && element.parentElement instanceof HTMLElement) {
        this.parent = observe(element.parentElement, {
          visibilityDetection: true
        });
      }

      this.target.onDimChange(() => this.updateTarget());
      [0,10,50,100].forEach(ms => setTimeout(() => this.updateTarget(), ms));
    }
  }

  static update(
    state: Partial<ParallaxState> = {},
    ctx = 'default'
  ) {
    const entries = Parallax.registry.get(ctx);

    if (entries && entries.length > 0) {
      for (const entry of entries) {
        entry.update(state);
      }
    }
  }

  static lock(ctx = 'default', scope?: HTMLElement) {
    if (!this.locks.find(lock => lock.ctx === ctx && lock.scope === scope)) {
      this.locks.push({ ctx, scope });
    }
  }

  static unlock(ctx = 'default', scope?: HTMLElement) {
    const index = this.locks.findIndex(lock => lock.ctx === ctx && lock.scope === scope);

    if (index > -1) {
      this.locks.splice(index, 1);
    }
  }

  get context() {
    return this.config.context || 'default';
  }

  get speed() {
    return { x: 0, y: 0, ...(this.config.speed || {}) };
  }

  get progress() {
    return { x: this.resolvers.x.progress, y: this.resolvers.y.progress };
  }

  get scale() {
    if (this.config.masking) {
      const state = this.state;
      const mX = this.resolvers.x.maskShift;
      const mY = this.resolvers.y.maskShift;

      return 1 + (mX > mY ? mX / state.width : mY / state.height);
    }

    return 1;
  }

  private updateResolvers() {
    const state = this.state;
    const config = this.config;
    const speed = this.speed;
    const culling = this.config.culling !== false && !this.config.masking;

    this.resolvers.x.update({
      pos: state.x,
      size: state.width,
      speed: speed.x,
      maxSize: state.maxWidth,
      scrollPos: state.scrollX,
      viewSize: state.viewWidth
    });

    this.resolvers.y.update({
      pos: state.y,
      size: state.height,
      speed: speed.y,
      maxSize: state.maxHeight,
      scrollPos: state.scrollY,
      viewSize: state.viewHeight
    });

    state.shiftX = this.resolvers.x.shift(culling);
    state.shiftY = this.resolvers.y.shift(culling);
    state.startX = this.resolvers.x.state.shiftStart;
    state.startY = this.resolvers.y.state.shiftStart;
    state.endX = this.resolvers.x.state.shiftEnd;
    state.endY = this.resolvers.y.state.shiftEnd;

    if (config.clamp === 'parent' && this.parent && this.target) {
      const minY = this.parent.y - this.target.y;
      const maxY = this.parent.height - this.target.height + minY;
      const minX = this.parent.x - this.target.x;
      const maxX = this.parent.width - this.target.width + minX;

      state.shiftX = clamp(state.shiftX, minX, maxX);
      state.shiftY = clamp(state.shiftY, minY, maxY);
      state.startX = clamp(state.startX, minX, maxX);
      state.startY = clamp(state.startY, minY, maxY);
      state.endX = clamp(state.endX, minX, maxX);
      state.endY = clamp(state.endY, minY, maxY);
    }
  }

  private isLocked() {
    return !!Parallax.locks.find(lock => {
      const contextMatch = lock.ctx === this.context;

      if (lock.scope && this.target) {
        return contextMatch && lock.scope.contains(this.target.ref);
      }

      return contextMatch;
    })
  }

  private updateTarget() {
    const target = this.target;

    if (target && !this.isLocked()) {
      this.state.x = target.left;
      this.state.y = target.top;
      this.state.width = target.width;
      this.state.height = target.height;

      this.update(this.state);
    }
  }

  private updateObservable() {
    if ( ! this.target) {
      return;
    }

    const state = this.state;
    const config = this.config;
    const scale = this.scale;
    const maskingTarget = this.parent || this.target;
    const elementConfig = this.config.element as ParallaxElementConfig;
    const visible = config.masking ? maskingTarget.visible : (
      between(state.shiftY, state.startY, state.endY, true) ||
      between(state.shiftX, state.startX, state.endX, true)
    );

    if ((config.culling !== false && visible) || config.culling === false) {
      let transform = '';

      if (elementConfig.transform !== false) {
        transform += `translate3d(`
          + `${state.shiftX.toFixed(3)}px,`
          + `${state.shiftY.toFixed(3)}px,`
          + `0`
        + `)`;
      }

      if (scale !== 1) {
        transform += ` scale(${scale})`;
      }

      if (transform) {
        this.target.ref.style.transform = transform;
      }
    }
  }

  update(newState: Partial<ParallaxState>) {
    if (this.isLocked()) {
      return;
    }

    const state = this.state = { ...this.state, ...newState };

    this.updateResolvers();

    if (isFunc(this.config.onUpdate)) {
      this.config.onUpdate(state, this.progress);
    }

    this.updateObservable();
  }

  destroy() {
    const entries = Parallax.registry.get(this.context);

    if (entries) {
      const index = entries.indexOf(this);

      if (index > -1) {
        entries.slice(index, 1);

        return true;
      }
    }

    if (this.target) {
      unobserve(this.target);
    }

    return false;
  }
}