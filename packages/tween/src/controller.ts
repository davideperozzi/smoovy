import { Ticker, TickerThread } from '@smoovy/ticker';

export interface TweenControllerConfig {
  duration?: number;
  delay?: number;
  reversed?: boolean;
  autoStart?: boolean;
  reverseDelay?: boolean;
  initSeek?: boolean;
  easing?: (x: number) => number;
  onSeek?: (progress: number) => void;
  onDelay?: (ms: number, progress: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: (wasRunning: boolean) => void;
  onComplete?: () => void;
  onReset?: () => void;
  onStart?: () => void;
}

export function mapRange(
  value: number,
  inStart: number,
  inEnd: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + (outMax - outMin) / (inEnd - inStart) * (value - inStart);
}

export class TweenController<
  T extends TweenControllerConfig = TweenControllerConfig,
> {
  private ticker = new Ticker();
  private _resolved = false;
  private _paused = false;
  private _overridden = false;
  private _passed = 0;
  private _progress = 0;
  private _reversed = false;
  private _started = false;
  protected _duration = 0;
  private thread?: TickerThread;
  private lastProgress = 0;
  private lastDelay = 0;
  private resolveFn?: () => void;

  constructor(
    protected config: T = {} as T
  ) {
    this._duration = typeof config.duration !== 'undefined'
      ? config.duration
      : 500;

    if (config.reversed) {
      this.reverse();
    }

    if (config.initSeek !== false) {
      requestAnimationFrame(() => this.seek(0, true));
    }

    if (config.autoStart !== false) {
      requestAnimationFrame(() => this.start());
    }
  }

  protected callback(fn?: any, values: any[] = []) {
    if (typeof fn === 'function') {
      fn(...values);
    }
  }

  protected beforeStart() {}

  get progress() {
    return this._progress;
  }

  get delay() {
    return this.config.delay || 0;
  }

  get duration() {
    return this._duration + this.delay;
  }

  get paused() {
    return this._paused;
  }

  get complete() {
    return this._resolved;
  }

  get passed() {
    return this._progress * this.duration;
  }

  get reversed() {
    return this._reversed;
  }

  private resolve() {
    if (this.resolveFn && ! this._resolved) {
      this.resolveFn();
    }

    this._resolved = true;
  }

  override() {
    this._overridden = true;

    return this;
  }

  start(startFrom = 0) {
    if (this._overridden) {
      return this;
    }

    this.beforeStart();
    this.reset(0, true);

    const start = Ticker.now();

    this.thread = this.ticker.add((_delta, time) => {
      if ( ! this._paused) {
        this.seek(startFrom + time - start);
      }
    });

    return this;
  }

  resume() {
    this.pause(false);
  }

  pause(paused = true) {
    if (this._paused !== paused) {
      this._paused = paused;

      if (paused && this.thread) {
        this.thread.kill();
        delete this.thread;
      }

      if (paused) {
        this.callback(this.config.onPause);
      } else {
        this.callback(this.config.onResume);
      }

      if ( ! paused && ! this.thread) {
        this.start(this._passed);
      }
    }

    return this;
  }

  stop(silent = false) {
    const running = this.thread && ! this.thread.dead;

    this._started = false;

    if (running) {
      this.thread?.kill();
      delete this.thread;
    }

    if ( ! silent) {
      this.callback(this.config.onStop, [running]);
    }

    return this;
  }

  seek(ms: number, noDelay = false) {
    if (this._resolved) {
      return this;
    }

    if (this._reversed) {
      ms = this.duration - ms;
    }

    if (
      (! this._reversed && ms > 0 || this._reversed && ms < this.duration) &&
      ! this._started
    ) {
      this._started = true;

      this.callback(this.config.onStart);
    }

    const delay = noDelay ? 0 : this.delay;
    const passed = Math.min(Math.max(ms, 0), this.duration);
    this._progress = Math.min(Math.max(ms / this.duration, 0), 1);

    this.callback(this.config.onSeek, [this._progress]);

    if (
      ! this._reversed && passed >= this.duration ||
      this._reversed && passed <= 0
    ) {
      this.process(this._reversed ? 0 : 1, this._reversed ? 0 : 1);
      this.stop();
      this.resolve();
      this.callback(this.config.onComplete);

      return;
    }

    if ( ! noDelay && ms <= delay) {
      this.callback(this.config.onDelay, [ ms, ms / delay ]);
      this.lastDelay = ms;

      if (this.lastProgress !== 0) {
        this.lastProgress = 0;

        this.process(0, 0);
      }

      return;
    } else if ( ! noDelay && ms >= delay && this.lastDelay !== delay) {
      this.callback(this.config.onDelay, [ delay, 1 ]);

      this.lastDelay = delay;
    }

    this.lastProgress = (passed - delay) / (this.duration - delay);

    this.process(
      this.config.easing
        ? this.config.easing(this.lastProgress)
        : this.lastProgress,
      this.lastProgress
    );

    return this;
  }

  reset(seek = 0, silent = false) {
    this._resolved = false;
    this.lastProgress = 0;
    this.lastDelay = 0;

    if ( ! silent) {
      this.callback(this.config.onReset);
    }

    if (this.thread && ! this.thread.dead) {
      this.stop(silent);
    }

    this.seek(seek);

    return this;
  }

  reverse() {
    this._reversed = !this._reversed;

    this.stop(true);
    this.seek(0);

    return this;
  }

  then(onFulfilled: (controller: Omit<this, 'then'>) => void): Promise<this> {
    const self = this as any;
    const then = self.then;
    self.then = undefined;

    if (this._resolved) {
      onFulfilled(this);

      const result = Promise.resolve(this);
      self.then = then;

      return result;
    }

    return new Promise(resolve => {
      this.resolveFn = () => {
        resolve(this);
        onFulfilled(this);
        self.then = then;
      };
    });
  }

  protected process(eased: number, linear: number) {}
}