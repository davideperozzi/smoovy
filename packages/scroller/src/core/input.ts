import { Coordinate, objectDeepClone, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom } from './dom';

export interface ScrollerInputState {
  delta: Coordinate;
}

export interface ScrollerInputConfig {}
export type ScrollerInputSubscription = (event: ScrollerInputState) => void;

export abstract class ScrollerInput<
  C extends ScrollerInputConfig = ScrollerInputConfig
> {
  protected config = { } as C;
  private subscriptions: ScrollerInputSubscription[] = [];

  public constructor(
    protected dom: ScrollerDom,
    config?: Partial<C>
  ) {
    this.config = objectDeepClone(this.defaultConfig);

    if (config) {
      this.config = objectDeepMerge(this.defaultConfig, config);
    }
  }

  public get defaultConfig(): C {
    return {  } as C;
  }

  public abstract attach(): void;
  public abstract detach(): void;
  public abstract recalc(): void;

  public subscribe(cb: ScrollerInputSubscription) {
    this.subscriptions.push(cb);
  }

  public unsubscribeAll() {
    this.subscriptions = [];
  }

  protected emit(state: ScrollerInputState) {
    for (let i = 0, len = this.subscriptions.length; i < len; i++) {
      this.subscriptions[i].call(this, state);
    }
  }
}
