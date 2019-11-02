import { listenEl, listenCompose } from '@smoovy/event';

import { ScrollBehavior, ScrollerEvent } from '../core';
import { Ticker } from '@smoovy/ticker';

const behavior: ScrollBehavior = () => (scroller) => {
  const target = scroller.dom.container.element;
  const scrollListener = (event: Event) => {
    event.preventDefault();

    target.scrollLeft = target.scrollTop = 0;
  };

  const keydownListener = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      Ticker.requestAnimationFrame(() => {
        const activeEl = document.activeElement;

        if (activeEl && target.contains(activeEl) || target === activeEl) {
          const bounds = activeEl.getBoundingClientRect();
          const targetSize = scroller.dom.container.size;

          scroller.emit(ScrollerEvent.DELTA, {
            y: -bounds.top + targetSize.height / 2,
            x: -bounds.left + targetSize.width / 2
          });
        }
      });
    }
  };

  return listenCompose(
    listenEl(target, 'scroll', scrollListener),
    listenEl(document.documentElement, 'keydown', keydownListener)
  );
};

export default behavior;
