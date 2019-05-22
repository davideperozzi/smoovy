import { Coordinate, clamp } from '@smoovy/utils';

import { ScrollerTransformer } from '../core/transformer';

export class ClampTransformer extends ScrollerTransformer {
  public transform(
    scrollPos: Coordinate,
    virtualPos: Coordinate,
    update: () => void
  ) {
    const wrapperSize = this.dom.getWrapperSize();
    const containerSize = this.dom.getContainerSize();

    const maxScrollX = wrapperSize.width - containerSize.width;
    const maxScrollY = wrapperSize.height - containerSize.height;

    virtualPos.x = clamp(virtualPos.x, 0, maxScrollX);
    virtualPos.y = clamp(virtualPos.y, 0, maxScrollY);

    update();
  }
}
