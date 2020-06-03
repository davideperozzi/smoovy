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
    const contentSpan = document.createElement('div');
    const parentElement = scroller.dom.container.target.parentElement;
    const updateSize = () => {
      contentSpan.style.height = `${scroller.dom.wrapper.offset.height}px`;
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
      scroller.on(ScrollerEvent.RECALC, updateSize)
    );
  };
};

export { Config as NativeScrollbarConfig };
export default behavior;
