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
    let lockedPosX = 0;
    let lockedPosY = 0;
    let locked = false;
    const wrapper = scroller.dom.wrapper.target;
    const container = scroller.dom.container.target;
    const scrollPos = scroller.position.output;

    const unlock = () => {
      locked = false;

      if (cfg.target instanceof Window) {
        document.body.style.overflow = '';
      } else {
        container.style.height = '';
        container.style.overflow = '';
        wrapper.style.transform = '';

        scroller.scrollTo({ x: lockedPosX, y: lockedPosY }, true);
      }
    };

    const lock = () => {
      locked = true;

      if (cfg.target instanceof Window) {
        document.body.style.overflow = 'hidden';
      } else {
        lockedPosX = scrollPos.x;
        lockedPosY = scrollPos.y;

        container.style.height = '100vh';
        container.style.overflow = 'hidden';
        wrapper.style.transform = `
          translate3d(-${lockedPosX}px, -${lockedPosY}px, 0)
        `;
      }
    }

    if (scroller.isLocked()) {
      lock();
    }

    return listenCompose(
      listenEl(target, 'scroll', () => {
        if ( ! scrolling) {
          dragging = true;

          const virtPos = scroller.position.virtual;
          const scrollX = target instanceof Window
            ? target.scrollX
            : target.scrollLeft;
          const scrollY = target instanceof Window
            ? target.scrollY
            : target.scrollTop;

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
      }),
      scroller.on(ScrollerEvent.LOCK, () => {
        if (scroller.isLocked()) {
          lock();
        } else {
          unlock();
        }
      }),
      () => {
        if (locked) {
          unlock();
        }
      }
    );
  };
};

export { Config as ScrollContentConfig };
export default behavior;
