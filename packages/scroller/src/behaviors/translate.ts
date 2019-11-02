import { Coordinate, Browser } from '@smoovy/utils';

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
}

const defaultConfig = {
  firefoxFix: true
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    const element = scroller.dom.wrapper.element;
    const unlisten = scroller.on<Coordinate>(ScrollerEvent.OUTPUT, (pos) => {
      let transform = `translate3d(${-pos.x}px, ${-pos.y}px, 0)`;

      if (Browser.firefox && cfg.firefoxFix) {
        transform += ` rotate3d(0.01, 0.01, 0.01, 0.01deg)`;
      }

      element.style.transform = transform;
    });

    return () => {
      element.style.transform = '';
      unlisten();
    };
  };
};

export { Config as TranslateConfig };
export default behavior;
