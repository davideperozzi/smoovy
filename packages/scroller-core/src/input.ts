import { Coordinate, objectDeepClone, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom } from './dom';

export interface ScrollerInputState {
  delta: Coordinate;
}

export interface ScrollerInputConfig {}
export type ScrollerInputSubscription = (state: ScrollerInputState) => void;

export abstract class ScrollerInput<
  C extends ScrollerInputConfig = ScrollerInputConfig
> {
  public config = {} as C;
  private subscriptions: ScrollerInputSubscription[] = [];

  public constructor(
    protected dom: ScrollerDom,
    public userConfig?: Partial<C>
  ) {
    this.config = objectDeepClone(this.defaultConfig);

    if (userConfig) {
      this.config = objectDeepMerge(this.defaultConfig, userConfig);
    }
  }

  public get defaultConfig(): C {
    return {} as C;
  }

  public abstract attach(): void;
  public abstract detach(): void;

  public recalc() {}

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
