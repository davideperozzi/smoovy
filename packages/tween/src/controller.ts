import { Ticker, TickerTask } from '@smoovy/ticker';

export interface TweenControllerConfig {
  duration?: number;
  delay?: number;
  reversed?: boolean;
  autoStart?: boolean;
  reverseDelay?: boolean;
  initSeek?: boolean;
  easing?: (x: number) => number;
  onSeek?: (ms: number, progress: number) => void;
  onDelay?: (ms: number, progress: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: (wasTicking: boolean) => void;
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

interface SeekVars {
  ms: number;
  noDelay: boolean;
  reversed: boolean;
}

export class TweenController<
  T extends TweenControllerConfig = TweenControllerConfig,
> {
  protected ticker = Ticker.main;
  protected _overridden = false;
  protected _duration = 0;
  protected  lastSeekVars: SeekVars = { ms: 0, noDelay: false, reversed: false  };
  protected listeners = new Map<string, any>();
  protected _resolved = false;
  protected _paused = false;
  protected _passed = 0;
  protected _progress = 0;
  protected _reversed = false;
  protected _started = false;
  protected lastProgress = 0;
  protected lastDelay = 0;
  private task?: TickerTask;
  private resolveFn?: (...args: any[]) => void;

  constructor(
    protected config: T = {} as T
  ) {
    this._duration = typeof config.duration !== 'undefined'
      ? config.duration
      : 500;
  }

  protected callback(fn?: any, values: any[] = []) {
    if (typeof fn === 'function') {
      fn(...values);
    }
  }

  protected beforeStart() {}
  protected beforeStop() {}
  protected beforeSeek() {}

  onStart(cb: () => void) {
    this.setListener('onStart', cb);

    return this;
  }

  onComplete(cb: () => void) {
    this.setListener('onComplete', cb);

    return this;
  }

  onStop(cb: (wasTicking: boolean) => void) {
    this.setListener('onStop', cb);

    return this;
  }

  protected callListeners(name: string, args: any[] = []) {
    const listeners = this.listeners.get(name);

    if (listeners) {
      listeners.forEach((cb: any) => cb(...args));
    }
  }

  private setListener(name: string, cb: (...args: any[]) => void) {
    if ( ! this.listeners.has(name)) {
      this.listeners.set(name, []);
    }

    this.listeners.get(name).push(cb);
  }

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

  protected resolve() {
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

    this.task = this.ticker.add((_delta, time) => {
      if ( ! this._paused) {
        this.seek(startFrom + time);
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

      if (paused && this.task) {
        this.task.kill();
        delete this.task;
      }

      if (paused) {
        this.callback(this.config.onPause);
      } else {
        this.callback(this.config.onResume);
      }

      if ( ! paused && ! this.task) {
        this.start(this._passed);
      }
    }

    return this;
  }

  stop(silent = false) {
    const ticking = !!this.task;
    const started = this._started

    this._started = false;

    if (ticking && this.task) {
      this.task.kill();
      delete this.task;
    }

    this.beforeStop();

    if ( ! silent && started) {
      this.callback(this.config.onStop, [ticking]);
      this.callListeners('onStop', [ticking]);
    }

    return this;
  }

  seekDelay(ms: number, noDelay = false) {
    const delay = noDelay ? 0 : this.delay;

    if ( ! noDelay && ms <= delay) {
      this.callback(this.config.onDelay, [ ms, ms / delay ]);
      this.lastDelay = ms;

      return false;
    } else if ( ! noDelay && ms >= delay && this.lastDelay !== delay) {
      this.callback(this.config.onDelay, [ delay, 1 ]);

      this.lastDelay = delay;
    }

    return true;
  }

  preSeek(ms: number, noDelay = false) {
    if (this._resolved) {
      return false;
    }

    if (
      this.lastSeekVars.ms === ms &&
      this.lastSeekVars.noDelay === noDelay &&
      this.lastSeekVars.reversed === this._reversed
    ) {
      return false;
    }

    this.lastSeekVars.ms = ms;
    this.lastSeekVars.noDelay = noDelay;
    this.lastSeekVars.reversed = this._reversed;

    if (ms > 0 && ! this._started) {
      this._started = true;

      this.beforeSeek();
      this.callback(this.config.onStart);
      this.callListeners('onStart');
    }

    return true;
  }

  seek(ms: number, noDelay = false) {
    if ( ! this.preSeek(ms, noDelay)) {
      return this;
    }

    if (this._reversed) {
      ms = this.duration - ms;
    }

    if (
      ( ! this._reversed && ms > 0 || this._reversed && ms < this.duration) &&
      ! this._started
    ) {
      this._started = true;

      this.beforeSeek();
      this.callback(this.config.onStart);
      this.callListeners('onStart');
    }

    const delay = noDelay ? 0 : this.delay;
    const passed = Math.min(Math.max(ms, 0), this.duration);
    this._progress = Math.min(Math.max(ms / this.duration, 0), 1);

    this.callback(this.config.onSeek, [passed, this._progress]);

    if (
      ! this._reversed && passed >= this.duration ||
      this._reversed && passed <= 0
    ) {
      this.process(this._reversed ? 0 : 1, this._reversed ? 0 : 1);
      this.stop();
      this.resolve();
      this.callback(this.config.onComplete);
      this.callListeners('onComplete');

      return this;
    }

    if ( ! this.seekDelay(ms, noDelay)) {
      if (this.lastProgress !== 0) {
        this.lastProgress = 0;

        this.process(0, 0);
      }

      return this;
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
    const lastActivity = this._reversed ? 1 - this._progress : this._progress;

    this._resolved = false;
    this.lastProgress = 0;
    this.lastDelay = 0;

    if ( ! silent) {
      this.callback(this.config.onReset);
    }

    if (this._started || seek > 0 || lastActivity > 0) {
      this.seek(seek, true);
    }

    if (this.task) {
      this.stop(silent);
    }

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

  process(eased: number, linear: number) {
    return this;
  }
}