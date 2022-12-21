import { clamp, isNum, mapRange, roundDec } from '@smoovy/utils';

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
    return roundDec(
      mapRange(
        this.shift(true),
        Math.min(this.state.shiftStart, this.state.shiftEnd),
        Math.max(this.state.shiftStart, this.state.shiftEnd),
        0,
        1
      ) || 0,
      3
    );
  }

  get norm() {
    if (this.config.normalize === false) {
      return 0;
    } else if (this.isEntry()) {
      return this.midView - this.mid - this.state.pos;
    } else if (this.isOutro()) {
      return -this.midView + this.mid;
    }

    return 0;
  }

  get maskShift() {
    return this.state.speed < 0
      ? Math.abs((this.midView + this.mid) * 2 * this.state.speed)
      : (this.midView - this.mid) * 2 * this.state.speed;
  }

  update(newState: Partial<ParallaxResolverState>) {
    const state = this.state = { ...this.state, ...newState };

    if (this.checksum !== this.lastChecksum) {
      this.lastChecksum = this.checksum;

      const maxShift = this.maxShift();

      state.shiftStart = state.speed < 0 ? maxShift : -maxShift;
      state.shiftEnd = state.speed < 0 ? -maxShift : maxShift;

      if (this.config.normalize !== false) {
        if (this.isEntry()) {
          state.shiftStart = 0;
        }

        if (this.isOutro()) {
          state.shiftEnd = 0;
        }
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

  maxShift() {
    const state = this.state;
    const outro = this.isOutro();
    const buffer = 1;

    if (state.viewSize === 0 || state.speed === 1) {
      return 0;
    }

    return this.interpolate(
      (shift) => state.pos + shift,
      (scroll, pos) =>
        state.speed > 1
          ? scroll - pos - state.size > buffer
          : outro
              ? scroll - pos + state.viewSize < buffer
              : scroll - pos - state.size < buffer
    );
  }

  private isEntry() {
    const state = this.state;

    return state.pos < state.viewSize;
  }

  private isOutro() {
    const state = this.state;

    return state.pos + state.size > state.maxSize - state.viewSize;
  }

  private get checksum() {
    const state = this.state;

    return state.pos + state.maxSize + state.size + state.viewSize;
  }

  private interpolate(
    position: (shift: number) => number,
    condition: (scroll: number, pos: number) => boolean,
    stepSize = 1
  ) {
    let pos = 0;
    let scroll = 0;
    let shift = 0;

    do {
      shift = this.shift(false, scroll);
      pos = position(shift);
      scroll += stepSize;
    } while (
      condition(scroll, pos) &&
      scroll + this.state.viewSize < this.state.maxSize
    );

    return shift;
  }
}