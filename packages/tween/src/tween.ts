import { Ticker, TickerThread } from '@smoovy/ticker';

import * as easings from './easing';
import { EasingImplementation } from './easing';
import { TweenRegistry } from './registry';
import { Tweenable, TweenTarget } from './tweenable';

export interface TweenOptions<V> {
  easing: EasingImplementation;
  duration: number;
  mutate: boolean;
  overwrite: boolean;
  stop: () => void;
  update: (values: V) => void;
  complete: () => void;
}

export class Tween<T = any> implements Tweenable {
  public static ticker = new Ticker();
  private static registry = new TweenRegistry();

  public constructor(
    public target: TweenTarget,
    public thread: TickerThread,
    protected options: Partial<TweenOptions<T>>
  ) {
    Tween.registry.add(this, options.overwrite);
  }

  private static getChanges<T extends TweenTarget>(
    from: T,
    to: Partial<T>
  ): typeof to {
    const changes: typeof to = {};

    for (const key in from) {
      if (from.hasOwnProperty(key) && to.hasOwnProperty(key)) {
        const change = (to[key] as number) - from[key];

        if (change !== 0) {
          changes[key as string] = change;
        }
      }
    }

    return changes;
  }

  public static fromTo<T extends TweenTarget>(
    fromTarget: T,
    toValues: Partial<T>,
    options: Partial<TweenOptions<T>> = {}
  ): Tween<T> {
    const changes = this.getChanges<T>(fromTarget, toValues);
    const duration = options.duration || 0;
    const changed = Object.keys(changes).length !== 0;
    const easing = options.easing || easings.Circ.out;
    const stableTarget = { ...fromTarget };
    const target = options.mutate === false
      ? { ...fromTarget }
      : fromTarget;

    if (options.overwrite !== false) {
      Tween.registry.remove(fromTarget);
    }

    let msPassed = 0;
    const tickerThread = this.ticker.add((delta, time, kill) => {
      msPassed += delta / this.ticker.intervalMs;

      if ( ! changed) {
        kill();
      }

      if (msPassed > 0) {
        for (const prop in changes) {
          if (changes.hasOwnProperty(prop)) {
            target[prop as string] = easing(
              msPassed,
              stableTarget[prop],
              changes[prop] as number,
              duration
            );
          }
        }

        if (options.update) {
          options.update.call(this, target);
        }
      }

      if (msPassed >= 0 && msPassed >= duration) {
        for (const prop in changes) {
          if (changes.hasOwnProperty(prop)) {
            target[prop as string] = toValues[prop];
          }
        }

        if (options.update) {
          options.update.call(this, target);
        }

        if (options.complete) {
          options.complete.call(this);
        }

        kill();
      }
    });

    return new Tween(
      fromTarget,
      tickerThread,
      options
    );
  }

  public stop() {
    if (this.thread) {
      this.thread.kill();

      if (this.options.stop) {
        this.options.stop.call(this);
      }
    }
  }
}
