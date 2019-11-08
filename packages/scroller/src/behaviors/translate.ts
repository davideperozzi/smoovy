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
}

const defaultConfig = {
  firefoxFix: true,
  initialStyles: true
};

const updateTransform = (
  element: HTMLElement,
  pos: Coordinate,
  rotate = false
) => {
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
    const element = scroller.dom.wrapper.element;
    const unlisten = scroller.on<Coordinate>(
      ScrollerEvent.OUTPUT,
      (pos) => updateTransform(element, pos, firefoxFix)
    );

    if (cfg.initialStyles) {
      updateTransform(element, { x: 0, y: 0 }, firefoxFix);
    }

    return () => {
      element.style.transform = '';
      unlisten();
    };
  };
};

export { Config as TranslateConfig };
export default behavior;
