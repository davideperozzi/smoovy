import { listenEl } from '@smoovy/event';
import { Browser } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
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

const defaultConfig = {
  passive: false,
  multiplier: 1,
  multiplierFirefox: 25
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    const target = cfg.target || document.documentElement;
    const listener = (event: WheelEvent) => {
      const delta = { x: 0, y: 0 };

      if ( ! config.passive) {
        event.preventDefault();
      }

      delta.x = (event as any).wheelDeltaX || event.deltaX * -1;
      delta.y = (event as any).wheelDeltaY || event.deltaY * -1;
      delta.x *= cfg.multiplier;
      delta.y *= cfg.multiplier;

      if (Browser.firefox && event.deltaMode === 1) {
        delta.x *= cfg.multiplierFirefox;
        delta.y *= cfg.multiplierFirefox;
      }

      scroller.emit(ScrollerEvent.DELTA, delta);
    };

    return Browser.wheelEvent
      ? listenEl(target, 'wheel', listener, { passive: cfg.passive })
      : undefined;
  };
};

export { Config as MouseWheelConfig };
export default behavior;
