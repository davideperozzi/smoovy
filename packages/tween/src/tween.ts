import { Ticker, TickerThread } from '@smoovy/ticker';

export interface TweenProps {
  [key: string]: number | any;
}

export interface TweenConfig<V> {
  from: V;
  to: Partial<V>;
  key?: any;
  delay?: number;
  duration?: number;
  mutate?: boolean;
  paused?: boolean;
  overwrite?: boolean;
  easing?: (x: number) => number;
  onStop?: () => void;
  onPause?: () => void;
  onStart?: () => void;
  onReset?: () => void;
  onDelay?: (passed: number) => void;
  onUpdate?: (values: V, progress: number) => void;
  onOverwrite?: () => void;
  onComplete?: () => void;
}

export function tweenFromTo<V extends TweenProps>(
  from: V,
  to: Partial<V>,
  config: Omit<TweenConfig<V>, 'from' | 'to'> = {}
) {
  return new Tween({ from, to, ...config });
}

function getChanges<T extends TweenProps>(
  from: T,
  to: Partial<T>
) {
  const changes = {} as typeof to;

  for (const key in from) {
    if (
      Object.prototype.hasOwnProperty.call(from, key) &&
      Object.prototype.hasOwnProperty.call(to, key)
    ) {
      const change = (to[key] as number) - from[key];

      if (change !== 0) {
        changes[key] = change as any;
      }
    }
  }

  return changes;
}

export class Tween<T extends TweenProps = any> {
  public static ticker = new Ticker();
  private static registry = new WeakMap<TweenProps | any, Tween>();
  private registry = Tween.registry;
  private ticker = Tween.ticker;
  private thread?: TickerThread;
  private delay?: TickerThread;
  private changes: Partial<T> = {};
  private stableTarget!: T;
  private currentTarget!: T;
  private firstTick = false;
  private _paused = false;
  private _complete = false;
  private _passed = 0;

  constructor(
    private config: TweenConfig<T>
  ) {
    this.stableTarget = { ...config.from };

    this.init();
  }

  public get easing() {
    return this.config.easing || ((x: number) => x);
  }

  public get duration() {
    return typeof this.config.duration === 'number'
      ? this.config.duration
      : 500;
  }

  private callback(fn?: any, values: any[] = []) {
    if (typeof fn === 'function') {
      fn(...values);
    }
  }

  public get paused() {
    return this._paused;
  }

  public get complete() {
    return this._complete;
  }

  public get target() {
    return this.config.from;
  }

  public get values() {
    return this.config.to;
  }

  public get passed() {
    return this._passed;
  }

  public set passed(ms: number) {
    this._passed = Math.min(ms, this.duration);

    this.handleTick(this.currentTarget);
  }

  public get key() {
    return this.config.key || this.target;
  }

  public get progress() {
    return this.passed / this.duration;
  }

  public set progress(percent: number) {
    this.passed = this.duration * percent;
  }

  private startDelay(ms: number) {
    const start = Ticker.now();

    this.delay = this.ticker.add(
      (_delta, time, kill) => {
        if (this._paused) {
          return;
        }

        const passed = time - start;
        const ended = passed >= ms;

        if (typeof this.config.onDelay === 'function') {
          this.config.onDelay(ended ? ms : passed);
        }

        if (ended) {
          delete this.delay;
          kill();
        }
      }
    );

    return this.delay;
  }

  private overwrite(key: T) {
    const tween = this.registry.get(key);

    if (tween instanceof Tween) {
      tween.stop();
      this.registry.delete(key);
      this.callback(this.config.onOverwrite);
    }
  }

  private init()  {
    if (this.thread && ! this.thread.dead) {
      this.thread.kill();
    }

    this.changes = getChanges(this.target, this.values);
    this.currentTarget = this.config.mutate === false
      ? { ...this.target }
      : this.target;

    const changed = Object.keys(this.changes).length !== 0;

    if (this.config.overwrite !== false) {
      this.overwrite(this.key);
    }

    this.registry.set(this.key, this);
    this.firstTick = true;
    this._complete = false;
    this._passed = 0;

    if (this.config.paused === true) {
      this.pause();
    }

    if (this.delay) {
      this.delay.kill();
      delete this.delay;
    }

    if (typeof this.config.delay === 'number') {
      this.callback(this.config.onUpdate, [this.currentTarget, this.progress]);
      this.startDelay(this.config.delay);
    }

    this.thread = this.ticker.add((delta, time, kill) => {
      if (this._paused || this.delay) {
        return;
      }

      if ( ! changed) {
        kill();
        return;
      }

      this.passed += delta;
    });

    return this.thread;
  }

  private handleTick(target: T) {
    if (this.firstTick) {
      this.callback(this.config.onStart);
      this.firstTick = false;
    }

    if (this.passed >= 0) {
      this.process(target, (prop) => {
        const easing = this.easing(this.progress);
        const change = this.changes[prop] as number;

        return this.stableTarget[prop] + change * easing;
      });
    }

    if (this._passed >= 0 && this._passed >= this.duration) {
      if (this.thread && ! this.thread.dead) {
        this.thread.kill();
      }

      this.callback(this.config.onComplete);

      this._complete = true;
    }
  }

  private process(
    targetTo: T,
    value: (key: string) => number
  ) {
    for (const prop in this.changes) {
      if (Object.prototype.hasOwnProperty.call(this.changes, prop)) {
        targetTo[prop] = value(prop) as any;
      }
    }

    this.callback(this.config.onUpdate, [targetTo, this.progress]);
  }

  public stop() {
    if (this.thread && ! this.thread.dead) {
      this.thread.kill();

      this.callback(this.config.onStop);
    }

    return this;
  }

  public start() {
    if (this._paused) {
      this._paused = false;

      if (this.thread && ! this.thread.dead) {
        this.callback(this.config.onStart);
      }
    }

    return this;
  }

  public pause() {
    if ( ! this._paused) {
      this._paused = true;

      if (this.thread && ! this.thread.dead) {
        this.callback(this.config.onPause);
      }
    }

    return this;
  }

  public reset() {
    if (this.config.mutate !== false) {
      for (const x in this.stableTarget) {
        if (Object.prototype.hasOwnProperty.call(this.stableTarget, x)) {
          this.target[x] = this.stableTarget[x];
        }
      }
    }

    this.callback(this.config.onReset);
    this.init();

    return this;
  }
}
