import { Coordinate, Browser } from '@smoovy/utils';

import { ScrollBehavior } from '../core';

export interface MoveContentConfig {
  /**
   * Since firefox has a problem with tweening transforms,
   * this will add a little trick to prevent firefox from
   * executing flickering animations by adding a 3d rotation
   * of 0.01deg to the transform property.
   * Default: true
   */
  firefoxFix?: boolean;
}

export const moveContent: ScrollBehavior<MoveContentConfig> = (config = {
  firefoxFix: true
}) => ({
  name: 'movecontent',
  attach: (scroller) => {
    return scroller.on<Coordinate>('output', (pos) => {
      const element = scroller.dom.wrapper.element;
      let transform = `translate3d(${-pos.x}px, ${-pos.y}px, 0)`;

      if (Browser.firefox && config.firefoxFix) {
        transform += ` rotate3d(0.01, 0.01, 0.01, 0.01deg)`;
      }

      element.style.transform = transform;
    });
  }
});
