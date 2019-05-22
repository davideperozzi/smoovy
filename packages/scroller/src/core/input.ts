import { Coordinate, objectDeepMerge } from '@smoovy/utils';

import { ScrollerTransformer } from '../../dist/typings/core/transformer';
import { ScrollerDom } from './dom';

export interface ScrollerInputEvent {
  delta: Coordinate;
}

export interface ScrollerInputConfig { }
export type ScrollerInputSubscription = (event: ScrollerInputEvent) => void;

export abstract class ScrollerInput<
  C extends ScrollerInputConfig = ScrollerInputConfig
> {
  protected config: C = {} as C;
  private subscriptions: ScrollerInputSubscription[] = [];

  public constructor(
    protected dom: ScrollerDom,
    config?: C
  ) {
    if (config) {
      objectDeepMerge(this.config, config);
    }
  }

  public abstract attach(): void;
  public abstract detach(): void;

  protected emit(event: ScrollerInputEvent) {
    for (let i = 0, len = this.subscriptions.length; i < len; i++) {
      this.subscriptions[i].call(this, event);
    }
  }

  public subscribe(cb: ScrollerInputSubscription) {
    this.subscriptions.push(cb);
  }

  public unsubscribeAll() {
    this.subscriptions = [];
  }
}
