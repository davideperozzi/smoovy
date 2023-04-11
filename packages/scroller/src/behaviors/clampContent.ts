import { listenCompose } from '@smoovy/listener';
import { observe, unobserve } from '@smoovy/observer';
import { clamp, Coordinate } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * The wrapper to use for clamp calculations
   *
   * Default: scroller.dom.container
   */
  container?: HTMLElement | Window;

  /**
   * The wrapper to use for clamp calculations
   *
   * Default: scroller.dom.wrapper
   */
  wrapper?: HTMLElement | Window;

  /**
   * This will use `scrollWidth` and `scrollHeight` on the wrapper to determine
   * the max scroll values. This can be useful if you're using a hybrid native
   * scrolling technique
   *
   * Default: false
   */
  useScrollSize?: boolean;
}

const behavior: ScrollBehavior<Config> = (config = {}) => (scroller) => {
  const dom = scroller.dom;
  const wrapper = config.wrapper
    ? observe(config.wrapper, { resizeDetection: true })
    : dom.wrapper;
  const container = config.container
    ? observe(config.container, { resizeDetection: true })
    : dom.container;
  const native = config.useScrollSize && ! (wrapper.ref instanceof Window);

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
        const size = native ? wrapper.scrollSize : wrapper.size;
        const maxScrollX = Math.max(size.width - container.width, 0);
        const maxScrollY = Math.max(size.height - container.height, 0);

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
