import { listenEl } from '@smoovy/event';

import { ScrollBehavior } from '../core';
import { Browser } from '@smoovy/utils';

export interface KeyboardConfig {
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
   * The delta value for the space key
   * Default: 150
   */
  spaceDelta?: number;
}

const defaultConfig = {
  passive: false,
  target: Browser.client ? document.documentElement : undefined,
  eventName: 'keydown',
  arrowDelta: 100,
  spaceDelta: 200
};

export const keyboard: ScrollBehavior<KeyboardConfig> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return {
    name: 'keyboard',
    attach: (scroller) => {
      const target = cfg.target as HTMLElement;
      const listener = (event: KeyboardEvent) => {
        switch (event.key) {
          case ' ':
            scroller.emit('delta', { y: -cfg.spaceDelta });
            break;

          case 'ArrowLeft':
            scroller.emit('delta', { x: cfg.arrowDelta });
            break;

          case 'ArrowRight':
            scroller.emit('delta', { x: -cfg.arrowDelta });
            break;

          case 'ArrowDown':
            scroller.emit('delta', { y: -cfg.arrowDelta });
            break;

          case 'ArrowUp':
            scroller.emit('delta', { y: cfg.arrowDelta });
            break;
        }
      };

      return Browser.wheelEvent
        ? listenEl(
            target,
            cfg.eventName,
            listener as any,
            { passive: config.passive }
          )
        : () => {};
    }
  };
};
