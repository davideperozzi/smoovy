import { ScrollBehavior, ScrollerEvent } from '../core';
import { listenCompose, listenEl } from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';
import { lerp, between } from '@smoovy/utils';

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

    const getTouch = (event: TouchEvent) => {
      return (event.targetTouches ? event.targetTouches[0] : event) as Touch;
    };

    const handleTouchStart = (event: TouchEvent) => {
      ticker.kill();

      const touch = getTouch(event);

      startPos.x = touch.pageX;
      startPos.y = touch.pageY;

      down = true;
    };

    const handleTouchEnd = () => {
      if (down) {
        if (velocity.x !== 0 || velocity.y !== 0) {
          ticker.add((_delta, _time, kill) => {
            velocity.x = lerp(velocity.x, 0, cfg.velocityDamping);
            velocity.y = lerp(velocity.y, 0, cfg.velocityDamping);

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

    const handleTouchMove = (event: TouchEvent) => {
      if (down) {
        event.preventDefault();

        const delta = { x: 0, y: 0 };
        const touch = getTouch(event);

        delta.x = (touch.pageX - startPos.x) * cfg.deltaMultiplier;
        delta.y = (touch.pageY - startPos.y) * cfg.deltaMultiplier;

        const deltaTime = Ticker.now() - lastMove;

        velocity.x = (startPos.x - touch.pageX) / deltaTime;
        velocity.y = (startPos.y - touch.pageY) / deltaTime;
        velocity.x *= -1 * cfg.velocityMultiplier;
        velocity.y *= -1 * cfg.velocityMultiplier;

        startPos.x = touch.pageX;
        startPos.y = touch.pageY;
        lastMove = Ticker.now();

        scroller.emit(ScrollerEvent.DELTA, delta);
      }
    };

    return listenCompose(
      listenEl(
        target,
        'touchstart',
        handleTouchStart,
        { passive: cfg.passive }
      ),
      listenEl(doc, 'touchend', handleTouchEnd, { passive: cfg.passive }),
      listenEl(doc, 'touchmove', handleTouchMove, { passive: cfg.passive }),
    );
  };
};

export { Config as TouchInertiaConfig };
export default behavior;
