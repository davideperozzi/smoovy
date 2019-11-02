import { Unlisten } from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';

import { ScrollBehavior, ScrollerEvent, ScrollToEvent } from '../core';

const behavior: ScrollBehavior = () => (scroller) => {
  return scroller.on<ScrollToEvent>(ScrollerEvent.SCROLL_TO, (event) => {
    let unmute: Unlisten;

    if (event.skipOutputTransform) {
      unmute = scroller.muteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
    }

    scroller.updatePosition(event.pos);
    Ticker.requestAnimationFrame(() => {
      if (unmute) {
        unmute();
      }
    });
  });
};

export default behavior;
