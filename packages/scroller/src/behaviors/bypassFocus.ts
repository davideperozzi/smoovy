import { listen, listenCompose } from '@smoovy/listener';

import { ScrollBehavior, ScrollerEvent } from '../core';

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
  const focusTarget = config.focusTarget || window;
  const container = scroller.dom.container.ref;
  const ignoreIn = config.ignoreInside || [];
  const scrollListener = (event: Event) => {
    event.preventDefault();

    container.scrollLeft = container.scrollTop = 0;
  };

  const focusListener = (event: FocusEvent) => {
    requestAnimationFrame(() => {
      let activeEl = event.target as HTMLElement;

      while (activeEl.shadowRoot && activeEl.shadowRoot.activeElement) {
        activeEl = activeEl.shadowRoot.activeElement as HTMLElement;
      }

      if ( ! (activeEl instanceof HTMLElement)) {
        return;
      }

      const ignore = ignoreIn.map(el => el.contains(activeEl)).includes(true);

      if ( ! ignore && activeEl) {
        const bounds = activeEl.getBoundingClientRect();
        const targetSize = scroller.dom.container.ref.getBoundingClientRect();
        const visible = (
          bounds.bottom > 0 &&
          bounds.top < targetSize.height &&
          bounds.right > 0 &&
          bounds.left < targetSize.width
        );

        if ( ! visible) {
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
    listen(container, 'scroll', scrollListener),
    focusTarget
      ? listen(focusTarget as any, 'focus', focusListener, true)
      : undefined
  );
};

export { Config as BypassFocusConfig };
export default behavior;
