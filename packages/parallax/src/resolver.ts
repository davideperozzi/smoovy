import { clamp, isNum } from '@smoovy/utils';

export interface ParallaxResolverState {
  pos: number;
  size: number;
  speed: number;
  maxSize: number;
  shiftEnd: number;
  shiftStart: number;
  viewSize: number;
  scrollPos: number;
}

export interface ParallaxResolverConfig {
  normalize?: boolean;
}

export class ParallaxResolver {
  private lastChecksum = 0;
  public state: ParallaxResolverState = {
    pos: 0,
    size: 0,
    speed: 0,
    maxSize: 0,
    viewSize: 0,
    scrollPos: 0,
    shiftStart: 0,
    shiftEnd: 0
  };

  constructor(
    private config: ParallaxResolverConfig = {},
    state: Partial<ParallaxResolverState> = {},
  ) {
    this.state = { ...this.state, ...state };
  }

  get mid() {
    return this.state.size * .5;
  }

  get midView() {
    return this.state.viewSize * .5;
  }

  get progress() {
    const state = this.state;
    const shift = this.shift(true);

    return Math.abs(
      (shift - state.shiftStart) /
      (state.shiftEnd - state.shiftStart)
    ) || 0;
  }

  get norm() {
    if (this.config.normalize === false) {
      return 0;
    } else if (this.isEntry()) {
      return this.midView - this.mid - this.state.pos;
    } else if (this.isOutro()) {
      const bottom = this.state.pos + this.state.size - this.state.maxSize;

      return -this.midView + this.mid - bottom;
    }

    return 0;
  }

  get maskShift() {
    return this.state.speed < 0
      ? Math.abs((this.midView + this.mid - this.norm) * 2 * this.state.speed)
      : (this.midView - this.mid - this.norm) * 2 * this.state.speed;
  }

  update(newState: Partial<ParallaxResolverState>) {
    const state = this.state = { ...this.state, ...newState };

    state.shiftStart = this.shiftStart();
    state.shiftEnd = this.shiftEnd();

    if (this.config.normalize !== false) {
      if (this.isEntry()) {
        state.shiftStart = 0;
      }

      if (this.isOutro()) {
        state.shiftEnd = 0;
      }
    }
  }

  shift(clampShift = false, scrollPos?: number) {
    const state = this.state;
    const scroll = isNum(scrollPos) ? scrollPos : state.scrollPos;
    const shift = scroll - (state.pos + this.norm) + this.midView - this.mid;

    return !clampShift ? shift * state.speed : clamp(
      shift * state.speed,
      Math.min(state.shiftStart, state.shiftEnd),
      Math.max(state.shiftStart, state.shiftEnd)
    );
  }

  shiftStart() {
    const { pos, speed, viewSize } = this.state;
    const middle = this.midView - this.mid;
    const start = pos - viewSize - speed * (pos + this.norm - middle);

    if (speed === 1) {
      return this.shift(false, 0);
    }

    return this.shift(false, start / (1 - speed));
  }

  shiftEnd() {
    const { pos, size, speed, viewSize, maxSize } = this.state;
    const middle = this.midView - this.mid;
    const end = clamp(
      (pos + size - speed * (pos + this.norm - middle)) / (1 - speed),
      0,
      maxSize - viewSize
    );

    if (speed === 1) {
      return this.shift(false, maxSize - viewSize);
    }

    return this.shift(false, end);
  }

  private isEntry() {
    const state = this.state;

    return state.pos < state.viewSize;
  }

  private isOutro() {
    const state = this.state;

    return state.pos + state.size > state.maxSize - state.viewSize;
  }
}