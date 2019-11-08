import { listenEl } from '@smoovy/event';
import { Browser } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';
import { getDeltaByKeyEvent } from '../utils/keyboard';

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
   * The keyboard event on which to trigger the emission
   * Default: keydown
   */
  eventName?: keyof HTMLElementEventMap;

  /**
   * The delta value for the arrow keys
   * Default: 100
   */
  arrowDelta?: number;

  /**
   * The page up & down delta value
   * Default: 250
   */
  pageDelta?: number;

  /**
   * The delta value for the space key
   * Default: 150
   */
  spaceDelta?: number;

  /**
   * The delta value for home and end
   * Default: Infinity
   */
  homeEndDelta?: number;
}

const defaultConfig = {
  passive: false,
  target: Browser.client ? document.documentElement : undefined,
  eventName: 'keydown',
  arrowDelta: 100,
  pageDelta: 250,
  spaceDelta: 200,
  homeEndDelta: Infinity
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    const target = cfg.target as HTMLElement;
    const listener = (event: KeyboardEvent) => {
      const delta = getDeltaByKeyEvent(
        event,
        cfg.arrowDelta,
        cfg.pageDelta,
        cfg.spaceDelta,
        cfg.homeEndDelta
      );

      if (delta.x || delta.y) {
        scroller.emit(ScrollerEvent.DELTA, delta);
      }
    };

    return Browser.wheelEvent
      ? listenEl(
          target,
          cfg.eventName,
          listener as any,
          { passive: config.passive }
        )
      : undefined;
  };
};

export { Config as KeyboardConfig };
export default behavior;
