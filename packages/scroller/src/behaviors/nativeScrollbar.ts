import { listenCompose, listenEl } from '@smoovy/event';
import { Browser } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * The target to set the scroll listeners on
   * Default: window
   */
  target?: HTMLElement | Window;
}

const defaultConfig = {
  target: Browser.client ? window : undefined
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    let locked = false;
    const restorePos = { x: 0, y: 0 };
    const contentSpan = document.createElement('div');
    const parentElement = scroller.dom.container.target.parentElement;
    const updateSize = (height?: number) => {
      const wrapperHeight = scroller.dom.wrapper.offset.height;

      contentSpan.style.height = `${height ?? wrapperHeight}px`;
    };

    updateSize();

    if (parentElement) {
      parentElement.append(contentSpan);
    }

    return listenCompose(
      () => contentSpan.remove(),
      cfg.target
        ? listenEl(cfg.target, 'scroll', () => (
            scroller.emit(ScrollerEvent.DELTA, {
              x: scroller.position.virtual.x - window.scrollX,
              y: scroller.position.virtual.y - window.scrollY
            }))
          )
        : undefined,
      scroller.on(ScrollerEvent.RECALC, () => {
        if ( ! scroller.isLocked()) {
          updateSize();
        }
      }),
      scroller.on(ScrollerEvent.LOCK, () => {
        if (scroller.isLocked() && ! locked) {
          locked = true;
          restorePos.x = scroller.position.output.x;
          restorePos.y = scroller.position.output.y;

          updateSize(0);
        } else if (locked) {
          locked = false;

          updateSize();
          scroller.scrollTo(restorePos, true);
        }
      })
    );
  };
};

export { Config as NativeScrollbarConfig };
export default behavior;
