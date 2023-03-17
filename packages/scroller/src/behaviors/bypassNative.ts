import { listen, listenCompose, Unlisten } from '@smoovy/listener';
import { isNum } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent, ScrollToEvent } from '../core';

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
  const cfg = Object.assign({ ...defaultConfig }, config);
  const self: ReturnType<ScrollBehavior> = (scroller) => {
    const target = cfg.target || window;
    const detachedBehaviors: string[] = [];
    let unlisten: Unlisten | undefined;
    let active = false;

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
      const willActivate = cfg.condition();

      if (willActivate && ! active) {
        active = true;

        scroller.behaviors.forEach((b, name) => {
          if (b !== self) {
            scroller.detachBehavior(name);
            detachedBehaviors.push(name);
          }
        });

        unlisten = listenCompose(
          listen(target as HTMLElement, 'scroll', () => {
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
      } else if (active && ! willActivate) {
        active = false;

        if (unlisten) {
          unlisten();
          unlisten = undefined;
        }

        detachedBehaviors.forEach(name => scroller.attachBehavior(name));
        requestAnimationFrame(() => scroller.dom.recalc());
      }
    };

    setTimeout(check);

    return scroller.on(ScrollerEvent.RECALC, check);
  };

  return self;
};

export { Config as BypassNativeConfig };
export default behavior;
