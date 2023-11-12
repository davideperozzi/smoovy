import { listenCompose } from '@smoovy/listener';
import { Ticker, TickerTask } from '@smoovy/ticker';
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
   * The hertz value to base the delta value on. In general this will be the
   * assumed most covered refresh rate by the users. This is only being used
   * if `multiplyDelta` hasn't been disabled. Basicall the calculation is
   * the following: `deltaMs * (deltaBaseHz / 1000)`. This ensures a value
   * that is around 1 all the time. Mostly between 0.95 to 1.05
   *
   * Default: 60
   */
  deltaBaseHz?: number;

  /**
   * A custom ticker to use for the animation
   */
  ticker?: Ticker;
}

const defaultConfig = {
  damping: 0.1,
  precision: 0.009,
  mobileDamping: 0.18,
  multiplyDelta: true,
  deltaBaseHz: 60
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign({ ...defaultConfig }, config);

  return (scroller) => {
    let running = false;
    let disabled = false;
    let transform: OutputTransformEvent | undefined;
    const ticker = cfg.ticker || Ticker.main;
    const damping = Browser.mobile ? cfg.mobileDamping : cfg.damping;
    const unlisten = scroller.on<OutputTransformEvent>(
      ScrollerEvent.TRANSFORM_OUTPUT,
      (event: OutputTransformEvent) => {
        disabled = false;
        transform = event;
      }
    );
    const task = ticker.add((delta) => {
      if ( ! transform || disabled) {
        return;
      }

      const hzDelta = delta * (cfg.deltaBaseHz / 1000);
      const precision = cfg.precision;
      const lerpDamp = damping * (cfg.multiplyDelta ? hzDelta : 1);
      const virtual = scroller.position.virtual;
      const outputX = lerp(transform.pos.x, virtual.x, lerpDamp);
      const outputY = lerp(transform.pos.y, virtual.y, lerpDamp);
      const diffX = Math.abs(virtual.x - outputX);
      const diffY = Math.abs(virtual.y - outputY);
      const newPos = { x: outputX, y: outputY };
      const changed = diffX - precision > 0 || diffY - precision > 0;

      if ( ! running && changed) {
        running = true;
      }

      if (diffX < precision && diffY < precision) {
        disabled = true;
        running = false;
      } else {
        transform.step(newPos);
      }
    });

    return listenCompose(
      scroller.on(ScrollerEvent.SCROLL_TO, (event: any) => {
        disabled = true;

        if (event.skipOutputTransform) {
          scroller.muteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
        }

        const delta = { x: 0, y: 0 };

        if (typeof event.pos.x === 'number') {
          delta.x = scroller.position.virtual.x - event.pos.x;
        }

        if (typeof event.pos.y === 'number') {
          delta.y = scroller.position.virtual.y - event.pos.y;
        }

        scroller.updateDelta(delta);

        if (event.skipOutputTransform) {
          scroller.unmuteEvents(ScrollerEvent.TRANSFORM_OUTPUT);
        }
      }),
      unlisten,
      () => task?.kill()
    );
  };
};

export { Config as LerpContentConfig };

export default behavior;
