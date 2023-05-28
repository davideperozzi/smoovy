import { listenCompose, listen } from '@smoovy/listener';
import { Browser, isFunc } from '@smoovy/utils';

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
  multiplier?: number | (() => number);

  /**
   * The multiplier used on the delta value for firefox browsers
   * Default: 25
   */
  multiplierFirefox?: number | (() => number);

  /**
   * Whether to enable platform multiplier. This detects which platform is
   * being used and adjusts the given multiplier
   * Default: true
   */
  enablePlatformMultiplier?: boolean | (() => number);
}

const defaultConfig = {
  passive: false,
  multiplier: 1,
  enablePlatformMultiplier: true,
  multiplierFirefox: 25
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign({ ...defaultConfig }, config);
  const multiplier = {
    delta: isFunc(cfg.multiplier)
      ? cfg.multiplier
      : () => cfg.multiplier,
    firefox: isFunc(cfg.multiplierFirefox)
      ? cfg.multiplierFirefox
      : () => cfg.multiplierFirefox,
    enablePlatform: isFunc(cfg.enablePlatformMultiplier)
      ? cfg.enablePlatformMultiplier
      : () => cfg.enablePlatformMultiplier
  };

  return (scroller) => {
    const target = cfg.target || document.documentElement;
    const listener = (event: WheelEvent) => {
      const delta = { x: 0, y: 0 };
      let ratio = 1;

      if ( ! config.passive) {
        event.preventDefault();
      }

      if (multiplier.enablePlatform() && ! Browser.windows) {
        ratio = 0.4;
      }

      delta.x = event.deltaX * -1;
      delta.y = event.deltaY * -1;
      delta.x *= multiplier.delta() * ratio;
      delta.y *= multiplier.delta() * ratio;

      if (Browser.firefox && event.deltaMode === 1) {
        delta.x *= multiplier.firefox();
        delta.y *= multiplier.firefox();
      }

      scroller.emit(ScrollerEvent.DELTA, delta);
    };

    return listenCompose(
      Browser.wheelEvent
        ? listen(target, 'wheel', listener, { passive: cfg.passive })
        : undefined
    );
  };
};

export { Config as MouseWheelConfig };
export default behavior;
