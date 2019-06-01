import { ScrollerInput, ScrollerInputConfig } from '@smoovy/scroller-core';
import { Browser } from '@smoovy/utils/m/browser';

export interface MouseWheelInputConfig extends ScrollerInputConfig {
  multiplier: number;
  multiplierFirefox: number;
}

export class MouseWheelInput<
  C extends MouseWheelInputConfig = MouseWheelInputConfig
> extends ScrollerInput<C> {
  private wheelCb = (event: WheelEvent) => this.handleWheel(event);

  public get defaultConfig() {
    return {
      multiplier: 0.5,
      multiplierFirefox: 25
    } as C;
  }

  public attach() {
    if (Browser.wheelEvent) {
      this.dom.container.element.addEventListener(
        'wheel',
        this.wheelCb,
        false
      );
    }
  }

  public detach() {
    this.dom.container.element.removeEventListener('wheel', this.wheelCb);
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();

    const delta = { x: 0, y: 0 };

    delta.x = (event as any).wheelDeltaX || event.deltaX * -1;
    delta.y = (event as any).wheelDeltaY || event.deltaY * -1;

    delta.x *= this.config.multiplier;
    delta.y *= this.config.multiplier;

    if (Browser.firefox && event.deltaMode === 1) {
      delta.x *= this.config.multiplierFirefox;
      delta.y *= this.config.multiplierFirefox;
    }

    this.emit({ delta });
  }
}
