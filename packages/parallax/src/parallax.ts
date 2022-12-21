import { Observable, observe, unobserve } from '@smoovy/observer';
import {
  between, Coordinate, isFunc, isNum, isObj, isStr,
} from '@smoovy/utils';

import { ParallaxResolver } from './resolver';
import { ParallaxState, createState } from './state';

export interface ParallaxElementConfig {
  target: HTMLElement;
  masking?: boolean | HTMLElement;
  culling?: boolean;
  translate?: boolean;
}

export interface ParallaxConfig {
  context?: string;
  clamping?: boolean;
  normalize?: boolean;
  speed?: Partial<Coordinate>;
  element?: HTMLElement | ParallaxElementConfig;
  onUpdate?: (state: ParallaxState, progress: Coordinate) => void;
  onChange?: (state: ParallaxState, progress: Coordinate) => void;
}

export function parallax(config: ParallaxConfig) {
  return new Parallax(config);
}

export class Parallax {
  private static registry = new Map<string, Parallax[]>();
  protected observable?: Observable<HTMLElement>;
  protected state = createState();
  protected resolvers: Coordinate<ParallaxResolver> = {
    x: new ParallaxResolver(this.config),
    y: new ParallaxResolver(this.config)
  };

  constructor(
    protected config: ParallaxConfig
  ) {
    const entries = Parallax.registry.get(this.context);

    if (entries) {
      entries.push(this);
    } else {
      Parallax.registry.set(this.context, [this]);
    }

    if (config.element) {
      const element = config.element instanceof HTMLElement
        ? config.element
        : config.element.target;

      this.observable = observe(element, { resizeDetection: true });

      this.observable.onDimChange((observable) => {
        this.state.x = observable.left;
        this.state.y = observable.top;
        this.state.width = observable.width;
        this.state.height = observable.height;

        this.update(this.state);
      });
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

  get context() {
    return this.config.context || 'default';
  }

  get speed() {
    return { x: 0, y: 0, ...(this.config.speed || {}) }
  }

  get progress() {
    return { x: this.resolvers.x.progress, y: this.resolvers.y.progress };
  }

  private updateResolvers() {
    const state = this.state;
    const speed = this.speed;
    const clamp = this.config.clamping !== false;

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

    state.shiftX = this.resolvers.x.shift(clamp);
    state.shiftY = this.resolvers.y.shift(clamp);
    state.startX = this.resolvers.x.state.shiftStart;
    state.startY = this.resolvers.y.state.shiftStart;
    state.endX = this.resolvers.x.state.shiftEnd;
    state.endY = this.resolvers.y.state.shiftEnd;
  }

  private updateObservable() {
    if ( ! this.observable) {
      return;
    }

    const state = this.state;
    const config = this.config.element as ParallaxElementConfig;
    const visible = (
      between(state.shiftY, state.startY, state.endY) ||
      between(state.shiftX, state.startX, state.endX)
    );

    if ((config.culling !== false && visible) || config.culling === false) {
      let transform = '';

      if (config.translate !== false) {
        transform += `translate3d(
          ${state.shiftX.toFixed(3)}px,
          ${state.shiftY.toFixed(3)}px,
          0
        )`;
      }

      if (config.masking) {
        const mX = this.resolvers.x.maskShift;
        const mY = this.resolvers.y.maskShift;
        const scale = mX > mY ? mX / state.width : mY / state.height;

        transform += ` scale(${1 + scale})`;
      }

      if (transform) {
        this.observable.ref.style.transform = transform;
      }
    }
  }

  update(newState: Partial<ParallaxState>) {
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

    if (this.observable) {
      unobserve(this.observable);
    }

    return false;
  }
}