import { ScrollerInput, ScrollerInputConfig } from '@smoovy/scroller-core';
import { Browser, Coordinate } from '@smoovy/utils';

export interface TouchSwipeInputConfig extends ScrollerInputConfig {
  target: HTMLElement;
  passive: boolean;
  multiplier: number;
}

export class TouchSwipeInput<
  C extends TouchSwipeInputConfig = TouchSwipeInputConfig
> extends ScrollerInput<C> {
  protected startPosition: Coordinate = { x: 0, y: 0 };
  private touchStartCb = (event: TouchEvent) => this.handleTouchStart(event);
  private touchMoveCb = (event: TouchEvent) => this.handleTouchMove(event);

  public get defaultConfig() {
    return {
      passive: false,
      target: this.dom.container.element,
      multiplier: 2.5
    } as C;
  }

  public attach() {
    if (Browser.touchDevice) {
      this.config.target.addEventListener(
        'touchstart',
        this.touchStartCb,
        false
      );

      this.config.target.addEventListener(
        'touchmove',
        this.touchMoveCb,
        {
          passive: this.config.passive
        }
      );
    }
  }

  public detach() {
    this.config.target.removeEventListener('touchstart', this.touchStartCb);
    this.config.target.removeEventListener('touchmove', this.touchMoveCb);
  }

  protected getTouchByEvent(event: TouchEvent): Touch {
    return (event.targetTouches ? event.targetTouches[0] : event) as Touch;
  }

  protected handleTouchStart(event: TouchEvent) {
    const touch = this.getTouchByEvent(event);

    this.startPosition.x = touch.pageX;
    this.startPosition.y = touch.pageY;
  }

  protected handleTouchMove(event: TouchEvent) {
    if ( ! this.config.passive) {
      event.preventDefault();
    }

    const touch = this.getTouchByEvent(event);
    const delta = { x: 0, y: 0 };

    delta.x = (touch.pageX - this.startPosition.x) * this.config.multiplier;
    delta.y = (touch.pageY - this.startPosition.y) * this.config.multiplier;

    this.startPosition.x = touch.pageX;
    this.startPosition.y = touch.pageY;

    this.emit({ delta });
  }
}
