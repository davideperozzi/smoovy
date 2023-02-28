import { listenCompose } from '@smoovy/listener';
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

  /**
   * Maps the position to a new position
   * Default: (pos) => pos
   */
  mapPos?: (pos: Coordinate) => Coordinate;
}

const defaultConfig = {
  firefoxFix: true,
  initialStyles: true,
  precision: 2,
  mapPos: (pos: Coordinate) => pos
};

const updateTransform = (
  element: HTMLElement,
  pos: Coordinate,
  rotate = false,
  mapPos?: (pos: Coordinate) => Coordinate
) => {
  if (mapPos) {
    pos = mapPos(pos);
  }

  let transform = `translate3d(${-pos.x}px, ${-pos.y}px, 0)`;

  if (rotate) {
    transform += ` rotate3d(0.01, 0.01, 0.01, 0.01deg)`;
  }

  element.style.transform = transform;
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);
  const firefoxFix = cfg.firefoxFix && Browser.firefox;

  return (scroller) => {
    const element = scroller.dom.wrapper.ref;
    const unlisten = listenCompose(
      scroller.on<Coordinate>(
        ScrollerEvent.OUTPUT,
        (pos) => {
          if ( ! scroller.isLocked()) {
            const posX = parseFloat(pos.x.toFixed(cfg.precision));
            const posY = parseFloat(pos.y.toFixed(cfg.precision));

            updateTransform(
              element,
              { x: posX, y: posY },
              firefoxFix,
              cfg.mapPos
            );
          }
        }
      ),
      scroller.on(ScrollerEvent.RECALC, () => {
        const pos = scroller.position.virtual;

        if ( ! scroller.isLocked()) {
          updateTransform(element, pos, firefoxFix, cfg.mapPos);
        }
      })
    );

    if (cfg.initialStyles) {
      updateTransform(element, { x: 0, y: 0 }, firefoxFix, cfg.mapPos);
    }

    return () => {
      element.style.transform = '';
      unlisten();
    };
  };
};

export { Config as TranslateConfig };
export default behavior;
