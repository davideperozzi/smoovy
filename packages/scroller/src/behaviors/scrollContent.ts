import { listenCompose, listenEl } from '@smoovy/event';
import { Browser, Coordinate } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
   /**
   * The target to set the scroll listeners on
   * Default: window
   */
  target?: HTMLElement | Window;

  /**
   * The timeout (ms) used to detect that the user has finished scrolling.
   * Basically after `resetTimeout` -> (scrolling = false)
   *
   * Default: 100
   */
   resetTimeout?: number;
}

const defaultConfig: Config = {
  target: Browser.client ? window : undefined,
  resetTimeout: 100
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    const target = cfg.target || scroller.dom.wrapper.target;
    let scrolling = false;
    let dragging = false;
    let dragTimeout: any;
    let scrollTimeout: any;

    return listenCompose(
      listenEl(target, 'scroll', (event) => {
        if ( ! scrolling) {
          dragging = true;

          const isWindow = target instanceof Window;
          const virtPos = scroller.position.virtual;
          const scrollX = isWindow ? target.scrollX : target.scrollLeft;
          const scrollY = isWindow ? target.scrollY : target.scrollTop;

          scroller.muteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
          scroller.updateDelta({
            x: virtPos.x - scrollX,
            y: virtPos.y - scrollY
          });
        }

        clearTimeout(dragTimeout);
        dragTimeout = setTimeout(() => {
          dragging = false;

          scroller.unmuteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
        });
      }),
      scroller.onScroll((pos) => {
        if ( ! dragging) {
          scrolling = true;

          target.scrollTo(pos.x, pos.y);
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => scrolling = false, cfg.resetTimeout);
      })
    );
  };
};

export { Config as ScrollContentConfig };
export default behavior;
