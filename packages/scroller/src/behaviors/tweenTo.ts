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
            currentTween = undefined;
          }
        })
      );

      if (currentTween) {
        currentTween.stop();
        currentTween = undefined;
      }

      currentTween = Tween.fromTo(
        scroller.position.output,
        pos,
        {
          mutate: false,
          duration: options.duration,
          easing: options.easing,
          on: {
            update: (newPos) => {
              scroller.updateDelta({
                x: scroller.position.output.x - newPos.x,
                y: scroller.position.output.y - newPos.y
              });
            },
            stop: () => {
              unlisten();

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
