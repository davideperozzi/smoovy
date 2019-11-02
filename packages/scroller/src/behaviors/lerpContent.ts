import { Ticker, TickerThread } from '@smoovy/ticker';
import { between, lerp, round, cutdec } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent, OutputTransformEvent } from '../core';

export interface LerpContentConfig {
  /**
   * The damping used for the linear interpolation
   * The lower this value the smoother the animation
   * Default: 0.1
   */
  damping?: number;

  /**
   * The amount of output decimals to preserve. Usually more than 2
   * does not makes much sense when transforming the output normally.
   * Default: 2
   */
  precision?: number;

  /**
   * Defines when the animation will end.
   * The higher this value the more precise it will be.
   * This is simply used to cut the decimals of the delta value
   * from the current animation in order to determine if the animation's
   * finished
   * Default: 1
   */
  tolerance?: number;
}

const defaultConfig = {
  damping: 0.1,
  precision: 2,
  tolerance: 1
};

export const lerpContent: ScrollBehavior<LerpContentConfig> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return {
    name: 'lerpcontent',
    attach: (scroller) => {
      let thread: TickerThread;
      const ticker = new Ticker();
      const unlisten = scroller.on<OutputTransformEvent>(
        ScrollerEvent.TRANSFORM_OUTPUT,
        ({ pos, step }) => {
          if (thread) {
            thread.kill();
          }

          thread = ticker.add((_delta, _time, kill) => {
            const virtual = scroller.position.virtual;
            const outputX = lerp(pos.x, virtual.x, cfg.damping);
            const outputY = lerp(pos.y, virtual.y, cfg.damping);
            const diffX = cutdec(Math.abs(virtual.x - outputX), cfg.tolerance);
            const diffY = cutdec(Math.abs(virtual.y - outputY), cfg.tolerance);

            if (diffX > 0 || diffY > 0) {
              step({
                x: cutdec(outputX, cfg.precision),
                y: cutdec(outputY, cfg.precision)
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
    }
  };
};
