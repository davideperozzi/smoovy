import { Ticker, TickerThread } from '@smoovy/ticker';
import { Browser, lerp } from '@smoovy/utils';

import { OutputTransformEvent, ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * The damping used for the linear interpolation
   * The lower this value the smoother the animation
   * Default: 0.1
   */
  damping?: number;

  /**
   * The damping for mobile (touch) devices
   * Default: 0.18
   */
  mobileDamping?: number;

  /**
   * The value on which to decide when to stop the lerp calculations
   * Default: 0.009
   */
  precision?: number;

  /**
   * Disable this if you don't want to include the delta value from the
   * animation in your lerp functions damping value. By disabling this you get
   * different results for High frequency displays, since it renders the
   * animation faster
   * Default: true
   */
  multiplyDelta?: boolean;

  /**
   * A custom ticker to use for the animation
   */
  ticker?: Ticker;
}

enum Event {
  LERP_CONTENT_START = '+lerp-content-start',
  LERP_CONTENT_END = '+lerp-content-end'
}

const defaultConfig = {
  damping: 0.1,
  precision: 0.009,
  mobileDamping: 0.18,
  multiplyDelta: true
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    let thread: TickerThread;
    let running = false;
    const ticker = cfg.ticker || new Ticker();
    const damping = Browser.mobile ? cfg.mobileDamping : cfg.damping;
    const unlisten = scroller.on<OutputTransformEvent>(
      ScrollerEvent.TRANSFORM_OUTPUT,
      ({ pos, step }) => {
        if (thread) {
          thread.kill();
        }

        thread = ticker.add((delta, _time, kill) => {
          const lerpDamp = damping * (cfg.multiplyDelta ? delta : 1);
          const virtual = scroller.position.virtual;
          const outputX = lerp(pos.x, virtual.x, lerpDamp);
          const outputY = lerp(pos.y, virtual.y, lerpDamp);
          const diffX = Math.abs(virtual.x - outputX);
          const diffY = Math.abs(virtual.y - outputY);
          const newPos = { x: outputX, y: outputY };
          const changed = (
            (diffX - cfg.precision) > 0 ||
            (diffY - cfg.precision) > 0
          );

          if ( ! running && changed) {
            running = true;

            scroller.emit(Event.LERP_CONTENT_START, newPos);
          }

          if (diffX < cfg.precision && diffY < cfg.precision) {
            kill();

            if (running) {
              running = false;

              Ticker.requestAnimationFrame(() => {
                scroller.emit(Event.LERP_CONTENT_END, newPos);
              });
            }
          } else {
            step(newPos);
          }
        });
      }
    );

    return () => {
      unlisten();
      ticker.kill();
    };
  };
};

export {
  Config as LerpContentConfig,
  Event as LerpContentEvent
};

export default behavior;
