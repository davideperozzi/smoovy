import { clamp, Coordinate } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

export const clampContent: ScrollBehavior = () => ({
  name: 'clampcontent',
  attach: scroller => (
    scroller.on<Coordinate>(
      ScrollerEvent.TRANSFORM_VIRTUAL,
      (virtual) => {
        const wSize = scroller.dom.wrapper.size;
        const cSize = scroller.dom.container.size;
        const maxScrollX = Math.max(wSize.width - cSize.width, 0);
        const maxScrollY = Math.max(wSize.height - cSize.height, 0);

        return {
          x: clamp(virtual.x, 0, maxScrollX),
          y: clamp(virtual.y, 0, maxScrollY)
        };
      }
    )
  )
});
