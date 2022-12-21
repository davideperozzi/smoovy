import { Unlisten } from '@smoovy/listener';
import { Coordinate } from '@smoovy/utils';

import {
  ScrollBehavior as SmoovyScrollBehavior, ScrollerEvent, ScrollToEvent
} from '../core';

interface Config {
  /**
   * Use native mode. This will trigger the scroll events on
   * a defined target instead of the scroller directly
   */
  nativeTarget?: Window | HTMLElement;

  /**
   * The scroll behavior to use for the native target
   * Default: smooth
   */
  nativeBehavior?: ScrollBehavior;
}

const behavior: SmoovyScrollBehavior<Config> = (config = {}) => (scroller) => {
  return scroller.on<ScrollToEvent>(ScrollerEvent.SCROLL_TO, (event) => {
    let unmute: Unlisten;

    if (event.immediate) {
      unmute = scroller.muteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
    }

    const virtual = scroller.position.virtual;

    if (config.nativeTarget) {
      const position: ScrollToOptions = {};

      if (typeof event.pos.x === 'number') {
        position.left = event.pos.x;
      }

      if (typeof event.pos.y === 'number') {
        position.top = event.pos.y;
      }

      config.nativeTarget.scrollTo({
        behavior: event.immediate
          ? 'auto'
          : (config.nativeBehavior || 'smooth'),
        ...position
      });
    } else {
      const delta: Partial<Coordinate> = {};

      if (typeof event.pos.x === 'number') {
        delta.x = -(event.pos.x - virtual.x);
      }

      if (typeof event.pos.y === 'number') {
        delta.y = -(event.pos.y - virtual.y);
      }

      scroller.updateDelta(delta);
    }

    requestAnimationFrame(() => {
      if (unmute) {
        unmute();
      }
    });
  });
};

export { Config as ScrollToConfig };
export default behavior;
