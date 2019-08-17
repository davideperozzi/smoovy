import { Ticker, TickerThread } from '@smoovy/ticker';

import * as easings from './easing';
import { EasingImplementation } from './easing';

export interface TweenTarget {
  [key: string]: number;
}

export interface TweenCallbacks<V> {
  stop: () => void;
  pause: () => void;
  start: () => void;
  reset: () => void;
  delay: (passed: number) => void;
  update: (values: V, progress: number) => void;
  overwrite: () => void;
  complete: () => void;
}

export interface TweenOptions<V> {
  easing: EasingImplementation;
  delay: number;
  duration: number;
  mutate: boolean;
  paused: boolean;
  overwrite: boolean;
  on: Partial<TweenCallbacks<V>>;
}

function getChanges<T extends TweenTarget>(
  from: T,
  to: Partial<T>
) {
  const changes = {} as typeof to;

  for (const key in from) {
    if (from.hasOwnProperty(key) && to.hasOwnProperty(key)) {
      const change = (to[key] as number) - from[key];

      if (change !== 0) {
        changes[key] = change as any;
      }
    }
  }

  return changes;
}

export class Tween<T extends TweenTarget = any> {
  public static ticker = new Ticker();
  private static registry = new WeakMap<TweenTarget, Tween>();
  private registry = Tween.registry;
  private ticker = Tween.ticker;
  private thread?: TickerThread;
  private delay?: TickerThread;
  private changes: Partial<T> = {};
  private stableTarget: T;
  private currentTarget: T;
  private firstTick = false;
  private _paused = false;
  private _complete = false;
  private _passed = 0;

  public constructor(
    public target: T,
    public values: Partial<T>,
    protected options: Partial<TweenOptions<T>>
  ) {
    this.stableTarget = { ...target };

    this.createThread();
  }

  public static fromTo<T extends TweenTarget>(
    fromTarget: T,
    toValues: Partial<T>,
    options: Partial<TweenOptions<T>> = {}
  ): Tween<T> {
    return new Tween(fromTarget, toValues, options);
  }

  public get easing() {
    return this.options.easing || easings.Circ.out;
  }

  public get duration() {
    return typeof this.options.duration === 'number'
      ? this.options.duration
      : 100;
  }

  public get paused() {
    return this._paused;
  }

  public get complete() {
    return this._complete;
  }

  public get passed() {
    return this._passed;
  }

  public set passed(ms: number) {
    this._passed = Math.min(ms, this.duration);

    this.handleTick(this.currentTarget);
  }

  public get progress() {
    return this.passed / this.duration;
  }

  public set progress(percent: number) {
    this.passed = this.duration * percent;
  }

  private  runCallback<V>(
    name: keyof TweenCallbacks<V>,
    ...args: any[]
  ) {
    if (this.options.on && typeof this.options.on[name] === 'function') {
      (this.options.on[name] as any).apply(this, args);
    }
  }

  private createDelay(ms: number) {
    const start = Ticker.now();

    return this.delay = this.ticker.add(
      (_delta, time, kill) => {
        if (this._paused) {
          return;
        }

        const passed = time - start;

        if (passed >= ms) {
          this.runCallback('delay', ms);
          delete this.delay;
          kill();
        } else {
          this.runCallback('delay', passed);
        }
      }
    );
  }

  private overwriteTarget(target: T) {
    const tween = this.registry.get(target);

    if (tween instanceof Tween) {
      tween.stop();
      this.registry.delete(target);
      this.runCallback('overwrite');
    }
  }

  private createThread()  {
    if (this.thread && ! this.thread.dead) {
      this.thread.kill();
    }

    this.changes = getChanges(this.target, this.values);
    this.currentTarget = this.options.mutate === false
    ? { ...this.target }
    : this.target;

    const changed = Object.keys(this.changes).length !== 0;

    if (this.options.overwrite !== false) {
      this.overwriteTarget(this.target);
    }

    this.registry.set(this.target, this);
    this.firstTick = true;
    this._complete = false;
    this._passed = 0;

    if (this.options.paused === true) {
      this.pause();
    }

    if (this.delay) {
      this.delay.kill();
      delete this.delay;
    }

    if (typeof this.options.delay === 'number') {
      this.runCallback('update', this.currentTarget, this.progress);
      this.createDelay(this.options.delay);
    }

    return this.thread = this.ticker.add((delta, _time, kill) => {
      if (this._paused || this.delay) {
        return;
      }

      if ( ! changed) {
        kill();
        return;
      }

      this.passed += delta / Tween.ticker.intervalMs;
    });
  }

  private handleTick(target: T) {
    if (this.firstTick) {
      this.runCallback('start');
      this.firstTick = false;
    }

    /* istanbul ignore else */
    if (this.passed >= 0) {
      this.processChanges(target, (prop) => this.easing.call(
        this,
        this._passed,
        this.stableTarget[prop],
        this.changes[prop] as number,
        this.duration
      ));
    }

    /* istanbul ignore else */
    if (this._passed >= 0 && this._passed >= this.duration) {
      /* istanbul ignore else */
      if (this.thread && ! this.thread.dead) {
        this.thread.kill();
      }

      this.processChanges(target, (prop) => this.values[prop] as number);
      this.runCallback('complete');

      this._complete = true;
    }
  }

  private processChanges(
    targetTo: T,
    value: (key: string) => number
  ) {
    for (const prop in this.changes) {
      /* istanbul ignore else */
      if (this.changes.hasOwnProperty(prop)) {
        targetTo[prop] = value(prop) as any;
      }
    }

    this.runCallback('update', targetTo, this.progress);
  }

  public stop() {
    if (this.thread && ! this.thread.dead) {
      this.thread.kill();

      this.runCallback('stop');
    }

    return this;
  }

  public start() {
    if (this._paused) {
      this._paused = false;

      /* istanbul ignore else */
      if (this.thread && ! this.thread.dead) {
        this.runCallback('start');
      }
    }

    return this;
  }

  public pause() {
    if ( ! this._paused) {
      this._paused = true;

      if (this.thread && ! this.thread.dead) {
        this.runCallback('pause');
      }
    }

    return this;
  }

  public reset() {
    if (this.options.mutate !== false) {
      for (const x in this.stableTarget) {
        /* istanbul ignore else */
        if (this.stableTarget.hasOwnProperty(x)) {
          this.target[x] = this.stableTarget[x];
        }
      }
    }

    this.runCallback('reset');
    this.createThread();

    return this;
  }
}
