import { listenCompose, listenEl, Unlisten } from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';
import { Tween } from '@smoovy/tween';
import { isNum } from '@smoovy/utils';

import {
  ScrollBehavior, ScrollerEvent, ScrollToEvent, TweenToEvent,
} from '../core';
import { getDeltaByKeyEvent } from '../utils/keyboard';

interface Config {
  /**
   * The target to put all the events on
   * Default: Window
   */
  target?: Window | HTMLElement;

  /**
   * The condition to dermine whether
   * the native mode should be active or not
   * Default: () => false
   */
  condition?: () => boolean;
}

const defaultConfig = {
  condition: () => false
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);
  let self: ReturnType<ScrollBehavior>;

  return self = (scroller) => {
    const target = cfg.target || window;
    const detachedBehaviors: string[] = [];
    let unlisten: Unlisten | undefined;

    const getPos = () => {
      const x = target === window
        ? target.scrollX
        : (target as HTMLElement).scrollLeft;

      const y = target === window
        ? target.scrollY
        : (target as HTMLElement).scrollTop;

      return { x, y };
    };

    const check = () => {
      if (cfg.condition()) {
        scroller.behaviors.forEach((b, name) => {
          if (b !== self) {
            scroller.detachBehavior(name);
            detachedBehaviors.push(name);
          }
        });

        unlisten = listenCompose(
          listenEl(target, 'scroll', () => {
            const pos = getPos();

            scroller.emit(ScrollerEvent.DELTA, {
              x: scroller.position.virtual.x - pos.x,
              y: scroller.position.virtual.y - pos.y
            });
          }),
          scroller.on<ScrollToEvent>(ScrollerEvent.SCROLL_TO, ({ pos }) => {
            if (isNum(pos.x) || isNum(pos.y)) {
              const defPos = getPos();

              target.scrollTo(
                isNum(pos.x) ? pos.x as number : defPos.x,
                isNum(pos.y) ? pos.y as number : defPos.y
              );
            }
          })
        );

        scroller.on<TweenToEvent>(
          ScrollerEvent.TWEEN_TO,
          ({ pos, options }) => {
            const force = !!options.force;
            let tween: Tween | undefined;
            const shallowStop = () => {
              if (tween && ! force) {
                tween.stop();
                tween = undefined;
              }
            };

            const unlistenTween = listenCompose(
              listenEl(window, 'touchstart', shallowStop),
              listenEl(window, 'wheel', shallowStop),
              listenEl(window, 'keydown', (event) => {
                const delta = getDeltaByKeyEvent(event);

                if (event.key === 'Tab' || delta.x !== 0 || delta.y !== 0) {
                  shallowStop();
                }
              })
            );

            tween = Tween.fromTo(scroller.position.virtual, pos, {
              mutate: false,
              duration: options.duration,
              easing: options.easing,
              on: {
                update: (newPos) => window.scrollTo(newPos.x, newPos.y),
                complete: unlistenTween,
                stop: unlistenTween
              }
            });
          }
        );
      } else if (detachedBehaviors.length > 0) {
        if (unlisten) {
          unlisten();
          unlisten = undefined;
        }

        detachedBehaviors.forEach(name => scroller.attachBehavior(name));
        Ticker.requestAnimationFrame(() => scroller.dom.recalc());
      }
    };

    setTimeout(() => check());
    scroller.on(ScrollerEvent.RECALC, () => check());
  };
};

export { Config as BypassNativeConfig };
export default behavior;
