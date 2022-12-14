import { listenCompose } from '@smoovy/event';
import { Browser, Coordinate } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * Since firefox has a problem with tweening transforms,
   * this will add a little trick to prevent firefox from
   * executing flickering animations by adding a 3d rotation
   * of 0.01deg to the transform property.
   * Default: true
   */
  firefoxFix?: boolean;

  /**
   * Whether the styles should be set initially
   * Default: true
   */
  initialStyles?: boolean;

  /**
   * The decimal places to keep
   * Default: 2
   */
  precision?: number;
}

const defaultConfig = {
  firefoxFix: true,
  initialStyles: true,
  precision: 2
};

const updateTransform = (
  element: HTMLElement,
  posX = 0,
  posY = 0,
  rotate = false
) => {
  let transform = `translate3d(${-posX}px, ${-posY}px, 0)`;

  if (rotate) {
    transform += ` rotate3d(0.01, 0.01, 0.01, 0.01deg)`;
  }

  element.style.transform = transform;
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);
  const firefoxFix = cfg.firefoxFix && Browser.firefox;

  return (scroller) => {
    const element = scroller.dom.wrapper.target;
    const unlisten = listenCompose(
      scroller.on<Coordinate>(
        ScrollerEvent.OUTPUT,
        (pos) => {
          if ( ! scroller.isLocked()) {
            const posX = parseFloat(pos.x.toFixed(cfg.precision));
            const posY = parseFloat(pos.y.toFixed(cfg.precision));

            updateTransform(element, posX, posY, firefoxFix);
          }
        }
      ),
      scroller.on(ScrollerEvent.RECALC, () => {
        const pos = scroller.position.virtual;

        if ( ! scroller.isLocked()) {
          updateTransform(element, pos.x, pos.y, firefoxFix);
        }
      })
    );

    if (cfg.initialStyles) {
      updateTransform(element, 0, 0, firefoxFix);
    }

    return () => {
      element.style.transform = '';
      unlisten();
    };
  };
};

export { Config as TranslateConfig };
export default behavior;
