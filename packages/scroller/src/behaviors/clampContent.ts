import { listenCompose } from '@smoovy/event';
import { observe, unobserve } from '@smoovy/observer';
import { clamp, Coordinate } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * The wrapper to use for clamp calculations
   * Default: scroller.dom.container
   */
  container?: HTMLElement | Window;

  /**
   * The wrapper to use for clamp calculations
   * Default: scroller.dom.wrapper
   */
  wrapper?: HTMLElement | Window;
}

const behavior: ScrollBehavior<Config> = (config = {}) => (scroller) => {
  const dom = scroller.dom;
  const wrapper = config.wrapper
    ? observe(config.wrapper, { observeResize: true })
    : dom.wrapper;
  const container = config.container
    ? observe(config.container, { observeResize: true })
    : dom.container;

  if (config.container) {
    container.update();
  }

  if (config.wrapper) {
    wrapper.update();
  }

  return listenCompose(
    scroller.on<Coordinate>(
      ScrollerEvent.TRANSFORM_VIRTUAL,
      (virtual) => {
        const wSize = wrapper.offset;
        const cSize = container.offset;
        const maxScrollX = Math.max(wSize.width - cSize.width, 0);
        const maxScrollY = Math.max(wSize.height - cSize.height, 0);

        return {
          x: clamp(virtual.x, 0, maxScrollX),
          y: clamp(virtual.y, 0, maxScrollY)
        };
      }
    ),
    () => {
      if (config.container) {
        unobserve(container);
      }

      if (config.wrapper) {
        unobserve(wrapper);
      }
    }
  );
};

export { Config as ClampContentConfig };
export default behavior;
