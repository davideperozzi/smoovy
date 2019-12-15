import { Ticker, TickerThread } from '@smoovy/ticker';
import { Browser, cutDec, lerp } from '@smoovy/utils';

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
   * The amount of output decimals to preserve. Usually more than 2
   * does not makes much sense when transforming the output normally.
   * Default: 2
   */
  precision?: number;

  /**
   * A custom ticker to use for the animation
   */
  ticker?: Ticker;
}

const defaultConfig = {
  damping: 0.1,
  mobileDamping: 0.18,
  precision: 2
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    let thread: TickerThread;
    const ticker = cfg.ticker || new Ticker();
    const damping = Browser.mobile ? cfg.mobileDamping : cfg.damping;
    const tolerance = cfg.precision - 1;
    const unlisten = scroller.on<OutputTransformEvent>(
      ScrollerEvent.TRANSFORM_OUTPUT,
      ({ pos, step }) => {
        if (thread) {
          thread.kill();
        }

        thread = ticker.add((_delta, _time, kill) => {
          const virtual = scroller.position.virtual;
          const outputX = lerp(pos.x, virtual.x, damping);
          const outputY = lerp(pos.y, virtual.y, damping);
          const diffX = cutDec(Math.abs(virtual.x - outputX), tolerance);
          const diffY = cutDec(Math.abs(virtual.y - outputY), tolerance);

          if (diffX > 0 || diffY > 0) {
            step({
              x: cutDec(outputX, cfg.precision),
              y: cutDec(outputY, cfg.precision)
            });
          } else {
            kill();
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

export { Config as LerpContentConfig };
export default behavior;
