import { listenCompose, listen } from '@smoovy/listener';
import { Ticker } from '@smoovy/ticker';
import { between, lerp } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * A target element on which the event listeners will be placed
   * Default: `document.documentElement`
   */
  target?: HTMLElement;

  /**
   * Whether passive events are enabled or not.
   * Default: false
   */
  passive?: boolean;

  /**
   * The multiplier used on the delta value
   * Default: 1
   */
  deltaMultiplier?: number;

  /**
   * The multiplier used on the velocity values.
   * Default: 20
   */
  velocityMultiplier?: number;

  /**
   * The inertia (damping) applied to the velocity
   * Default: 0.08
   */
  velocityDamping?: number;

  /**
   * The minimum threshold range to enter before
   * canceling the velocity to 0 and stopping
   * the momentum animation
   * Default: 2
   */
  minimumThreshold?: number;

  /**
   * Whether to enable mouse events or not
   * This transform mouse events to touch events
   * and allows the user to drag the positions via mouse
   * Default: false
   */
  enableMouseEvents?: boolean;
}

const defaultConfig = {
  passive: false,
  deltaMultiplier: 1,
  velocityDamping: 0.08,
  velocityMultiplier: 20,
  minimumThreshold: 2
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    const doc = document.documentElement;
    const target = cfg.target || doc;
    const ticker = new Ticker();
    const startPos = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    const threshold = cfg.minimumThreshold;
    let lastMove = 0;
    let down = false;

    const getPosition = (event: TouchEvent | MouseEvent) => {
      if (event instanceof MouseEvent) {
        return { pageX: event.pageX, pageY: event.pageY };
      }

      return (event.targetTouches ? event.targetTouches[0] : event) as Touch;
    };

    const handleStart = (event: TouchEvent | MouseEvent) => {
      ticker.kill();

      const pos = getPosition(event);

      startPos.x = pos.pageX;
      startPos.y = pos.pageY;

      down = true;
    };

    const handleEnd = () => {
      if (down) {
        if (velocity.x !== 0 || velocity.y !== 0) {
          ticker.add((_delta, _time, kill) => {
            velocity.x = lerp(velocity.x, 0, cfg.velocityDamping);
            velocity.y = lerp(velocity.y, 0, cfg.velocityDamping);
            velocity.x = isFinite(velocity.x) ? velocity.x : 0;
            velocity.y = isFinite(velocity.y) ? velocity.y : 0;

            scroller.emit(ScrollerEvent.DELTA, velocity);

            if (
              between(velocity.x, threshold, -threshold) &&
              between(velocity.y, threshold, -threshold)
            ) {
              velocity.x = 0;
              velocity.y = 0;

              kill();
            }
          });
        }
      }

      down = false;
    };

    const handleMove = (event: TouchEvent | MouseEvent) => {
      if (down) {
        event.preventDefault();

        const delta = { x: 0, y: 0 };
        const pos = getPosition(event);

        delta.x = (pos.pageX - startPos.x) * cfg.deltaMultiplier;
        delta.y = (pos.pageY - startPos.y) * cfg.deltaMultiplier;

        const deltaTime = Ticker.now() - lastMove;

        velocity.x = (startPos.x - pos.pageX) / deltaTime;
        velocity.y = (startPos.y - pos.pageY) / deltaTime;
        velocity.x *= -1 * cfg.velocityMultiplier;
        velocity.y *= -1 * cfg.velocityMultiplier;

        startPos.x = pos.pageX;
        startPos.y = pos.pageY;
        lastMove = Ticker.now();

        scroller.emit(ScrollerEvent.DELTA, delta);
      }
    };

    return listenCompose(
      listen(target, 'touchstart', handleStart, { passive: cfg.passive }),
      listen(doc, 'touchmove', handleMove, { passive: cfg.passive }),
      listen(doc, 'touchend', handleEnd, { passive: cfg.passive }),
      cfg.enableMouseEvents ? listenCompose(
        listen(target, 'mousedown', handleStart, { passive: cfg.passive }),
        listen(doc, 'mousemove', handleMove, { passive: cfg.passive }),
        listen(doc, ['mouseup', 'mousecancel'], handleEnd, {
          passive: cfg.passive
        }),
      ) : undefined
    );
  };
};

export { Config as TouchInertiaConfig };
export default behavior;
