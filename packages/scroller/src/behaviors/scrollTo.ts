import { Unlisten } from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';
import { Coordinate } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent, ScrollToEvent } from '../core';

const behavior: ScrollBehavior = () => (scroller) => {
  return scroller.on<ScrollToEvent>(ScrollerEvent.SCROLL_TO, (event) => {
    let unmute: Unlisten;

    if (event.skipOutputTransform) {
      unmute = scroller.muteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
    }

    const delta: Partial<Coordinate> = {};
    const virtual = scroller.position.virtual;

    if (event.pos.x) {
      delta.x = -(event.pos.x - virtual.x);
    }

    if (typeof event.pos.y === 'number') {
      delta.y = -(event.pos.y - virtual.y);
    }

    scroller.updateDelta(delta);

    Ticker.requestAnimationFrame(() => {
      if (unmute) {
        unmute();
      }
    });
  });
};

export default behavior;
