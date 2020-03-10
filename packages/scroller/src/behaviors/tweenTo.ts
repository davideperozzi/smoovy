import { listenCompose, listenEl, Unlisten } from '@smoovy/event';
import { Tween } from '@smoovy/tween';

import { ScrollBehavior, ScrollerEvent, TweenToEvent } from '../core';

interface Config {
  /**
   * Use native mode. This will trigger the scroll events on
   * a defined target instead of the scroller directly
   */
  nativeTarget?: Window | HTMLElement;

  /**
   * Events used to detect changes on the native targets.
   * Default: [ 'wheel', 'touchmove' ]
   */
  nativeKillEvents?: (keyof HTMLElementEventMap)[];
}

const behavior: ScrollBehavior<Config> = (config = {}) => (scroller) => {
  let currentTween: Tween | undefined;

  return scroller.on<TweenToEvent>(
    ScrollerEvent.TWEEN_TO,
    ({ pos, options }) => {
      const force = !!options.force;
      const unlisten = listenCompose(
        config.nativeTarget === undefined
          ? listenCompose(
              scroller.on(ScrollerEvent.DELTA, () => {
                if (currentTween && ! force) {
                  currentTween.stop();
                }
              }),
              scroller.muteEvents(
                ScrollerEvent.TRANSFORM_OUTPUT,
                force && ScrollerEvent.DELTA
              )
            )
          : listenEl(
              config.nativeTarget,
              config.nativeKillEvents || ['wheel', 'touchmove'],
              () => {
                if (currentTween && ! force) {
                  currentTween.stop();
                }
              }
            )
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
              if (config.nativeTarget) {
                config.nativeTarget.scrollTo(newPos.x, newPos.y);
              } else {
                scroller.updateDelta({
                  x: scroller.position.virtual.x - newPos.x,
                  y: scroller.position.virtual.y - newPos.y
                });
              }
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

export { Config as TweenToConfig };
export default behavior;
