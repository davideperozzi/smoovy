import { listenCompose, listenEl } from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * Ignore focused elements within the given elements
   * Default: []
   */
  ignoreInside?: HTMLElement[];
}

const behavior: ScrollBehavior<Config> = (config = {}) => (scroller) => {
  const target = scroller.dom.container.element;
  const ignoreIn = config.ignoreInside || [];
  const scrollListener = (event: Event) => {
    event.preventDefault();

    target.scrollLeft = target.scrollTop = 0;
  };

  const keydownListener = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      Ticker.requestAnimationFrame(() => {
        const activeEl = document.activeElement;
        const ignore = ignoreIn.map(el => el.contains(activeEl)).includes(true);

        if (
          ! ignore &&
          activeEl &&
          target.contains(activeEl)
          || target === activeEl
        ) {
          const bounds = activeEl.getBoundingClientRect();
          const targetSize = scroller.dom.container.size;

          if (
            bounds.top <= 0 || bounds.top >= targetSize.height ||
            bounds.left <= 0 || bounds.right >= targetSize.width
          ) {
            scroller.emit(ScrollerEvent.DELTA, {
              y: -bounds.top + targetSize.height / 2,
              x: -bounds.left + targetSize.width / 2
            });
          }
        }
      });
    }
  };

  return listenCompose(
    listenEl(target, 'scroll', scrollListener),
    listenEl(document.documentElement, 'keydown', keydownListener)
  );
};

export { Config as BypassFocusConfig };
export default behavior;
