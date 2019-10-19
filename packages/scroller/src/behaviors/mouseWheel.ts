import { listenEl } from '@smoovy/event';

import { ScrollBehavior } from '../core';
import { Browser } from '@smoovy/utils';

export interface MouseWheelConfig {
  /**
   * A target element on which the event listeners will be placed
   * Default: `document.documentElement`
   */
  target?: HTMLElement;

  /**
   * Whether passive events are enabled or not.
   * Default: false
   */
  passive?: boolean;

  /**
   * The multiplier used on the delta value.
   * Default: 1
   */
  multiplier?: number;

  /**
   * The multiplier used on the delta value for firefox browsers
   * Default: 25
   */
  multiplierFirefox?: number;
}

export const mouseWheel: ScrollBehavior<MouseWheelConfig> = (config = {
  passive: false
}) => ({
  name: 'mousewheel',
  attach: (scroller) => {
    const target = (config && config.target) || document.documentElement;
    const listener = (event: WheelEvent) => {
      if ( ! config.passive) {
        event.preventDefault();
      }

      const delta = { x: 0, y: 0 };

      delta.x = (event as any).wheelDeltaX || event.deltaX * -1;
      delta.y = (event as any).wheelDeltaY || event.deltaY * -1;
      delta.x *= (config && config.multiplier) || 1;
      delta.y *= (config && config.multiplier) || 1;

      if (Browser.firefox && event.deltaMode === 1) {
        delta.x *= config.multiplierFirefox || 25;
        delta.y *= config.multiplierFirefox || 25;
      }

      scroller.emit({ delta });
    };

    return Browser.wheelEvent
      ? listenEl(target, 'wheel', listener, { passive: config.passive })
      : () => {};
  }
});
