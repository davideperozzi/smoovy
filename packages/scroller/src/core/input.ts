import { Coordinate, Browser, objectDeepMerge } from '@smoovy/utils';

export enum ScrollerInputType {
  DELTA = 1,
  ABSOLUTE = 2
}

export interface ScrollerInputEvent {
  mode: ScrollerInputType;
  data: Coordinate;
}

export interface ScrollerInputConfig { }
export type ScrollerInputSubscription = (event: ScrollerInputEvent) => void;

export abstract class ScrollerInput<
  C extends ScrollerInputConfig = ScrollerInputConfig
> {
  protected config: C = {} as C;
  private subscriptions: ScrollerInputSubscription[] = [];

  public constructor(
    protected target: HTMLElement,
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

export interface MouseScrollerInputConfig extends ScrollerInputConfig {
  multiplier: number;
  multiplierFirefox: number;
}

export class MouseScrollerInput<
  C extends MouseScrollerInputConfig = MouseScrollerInputConfig
> extends ScrollerInput<C> {
  protected config = {
    multiplier: 0.45,
    multiplierFirefox: 20
  } as C;
  private wheelCb = (event: WheelEvent) => this.handleWheel(event);

  public attach() {
    if (Browser.wheelEvent) {
      console.log(this.target);
      this.target.addEventListener(
        'wheel',
        this.wheelCb,
        false
      );
    }
  }

  public detach() {
    this.target.removeEventListener('wheel', this.wheelCb);
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();

    const data = { x: 0, y: 0 };

    data.x = (event as any).wheelDeltaX || event.deltaX * -1;
    data.y = (event as any).wheelDeltaY || event.deltaY * -1;

    data.x *= this.config.multiplier;
    data.y *= this.config.multiplier;

    if (Browser.firefox && event.deltaMode === 1) {
      data.x *= this.config.multiplierFirefox;
      data.y *= this.config.multiplierFirefox;
    }

    this.emit({ mode: ScrollerInputType.DELTA, data });
  }
}
