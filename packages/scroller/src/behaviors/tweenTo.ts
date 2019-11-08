import { listenCompose } from '@smoovy/event';
import { Tween } from '@smoovy/tween';

import { ScrollBehavior, ScrollerEvent, TweenToEvent } from '../core';

const behavior: ScrollBehavior = () => (scroller) => {
  let currentTween: Tween | undefined;

  return scroller.on<TweenToEvent>(
    ScrollerEvent.TWEEN_TO,
    ({ pos, options }) => {
      const force = !!options.force;
      const unlisten = listenCompose(
        scroller.muteEvents(
          ScrollerEvent.TRANSFORM_OUTPUT,
          force && ScrollerEvent.DELTA
        ),
        scroller.on(ScrollerEvent.DELTA, () => {
          if (currentTween && ! force) {
            currentTween.stop();
          }
        })
      );

      if (currentTween) {
        currentTween.stop();
      }

      currentTween = Tween.fromTo(
        scroller.position.virtual,
        pos,
        {
          mutate: false,
          duration: options.duration,
          easing: options.easing,
          on: {
            update: (newPos) => {
              scroller.updateDelta({
                x: scroller.position.virtual.x - newPos.x,
                y: scroller.position.virtual.y - newPos.y
              });
            },
            stop: () => {
              unlisten();
              currentTween = undefined;
            },
            complete: () => {
              unlisten();
              currentTween = undefined;
            }
          }
        }
      );
    }
  );
};

export default behavior;
