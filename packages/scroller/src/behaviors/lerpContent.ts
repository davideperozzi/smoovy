import { Ticker, TickerThread } from '@smoovy/ticker';
import { between, lerp } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent, OutputTransformEvent } from '../core';

export interface LerpContentConfig {
  /**
   * The damping used for the linear interpolation
   * The lower this value the smoother the animation
   * Default: 0.1
   */
  damping?: number;
}

export const lerpContent: ScrollBehavior<LerpContentConfig> = (config = {
  damping: 0.1
}) => ({
  name: 'lerpcontent',
  attach: (scroller) => {
    let thread: TickerThread;
    const ticker = new Ticker();
    const damping = typeof config.damping === 'number'
      ? config.damping
      : 0.1;

    const listener = scroller.on<OutputTransformEvent>(
      ScrollerEvent.TRANSFORM_OUTPUT,
      ({ pos, step }) => {
        if (thread) {
          thread.kill();
        }

        thread = ticker.add((_delta, _time, kill) => {
          const virtual = scroller.position.virtual;
          const output = {
            x: lerp(pos.x, virtual.x, damping),
            y: lerp(pos.y, virtual.y, damping)
          };

          const diffX = Math.abs(virtual.x - output.x);
          const diffY = Math.abs(virtual.y - output.y);

          if (
            !between(diffX, -damping / 2, damping / 2) ||
            !between(diffY, -damping / 2, damping / 2)
          ) {
            step(output);
          } else {
            kill();
          }
        });
      }
    );

    return () => {
      listener();
      ticker.kill();
    };
  }
});
