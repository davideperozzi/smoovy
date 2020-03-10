import { listenCompose, listenEl } from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';

import { ScrollBehavior, ScrollerEvent } from '../core';
import { Browser } from '@smoovy/utils';

interface Config {
  /**
   * Ignore focused elements within the given elements
   * Default: []
   */
  ignoreInside?: HTMLElement[];

  /**
   * The target to set the focus listener onto
   * Default: window
   */
  focusTarget?: Window | Document | HTMLElement;

  /**
   * Use native mode. This will trigger the scroll events on
   * a defined target instead of the scroller directly
   */
  nativeTarget?: Window | HTMLElement;
}

const behavior: ScrollBehavior<Config> = (config = {}) => (scroller) => {
  const focusTarget = config.focusTarget || Browser.client ? window : undefined;
  const container = scroller.dom.container.element;
  const ignoreIn = config.ignoreInside || [];
  const scrollListener = (event: Event) => {
    event.preventDefault();

    container.scrollLeft = container.scrollTop = 0;
  };

  const focusListener = (event: FocusEvent) => {
    Ticker.requestAnimationFrame(() => {
      const activeEl = event.target;

      if ( ! (activeEl instanceof HTMLElement)) {
        return;
      }

      const ignore = ignoreIn.map(el => el.contains(activeEl)).includes(true);

      if (
        ! ignore &&
        activeEl &&
        container.contains(activeEl)
        || container === activeEl
      ) {
        const bounds = activeEl.getBoundingClientRect();
        const targetSize = scroller.dom.container.size;

        if (
          bounds.top <= 0 || bounds.top >= targetSize.height ||
          bounds.left <= 0 || bounds.right >= targetSize.width
        ) {
          if (config.nativeTarget) {
            const position = scroller.position.virtual;

            config.nativeTarget.scrollTo(
              position.x + bounds.left - targetSize.width / 2,
              position.y + bounds.top - targetSize.height / 2
            );
          } else {
            scroller.emit(ScrollerEvent.DELTA, {
              y: -bounds.top + targetSize.height / 2,
              x: -bounds.left + targetSize.width / 2
            });
          }
        }
      }
    });
  };

  return listenCompose(
    listenEl(container, 'scroll', scrollListener),
    focusTarget
      ? listenEl(focusTarget, 'focus', focusListener, true)
      : undefined
  );
};

export { Config as BypassFocusConfig };
export default behavior;
