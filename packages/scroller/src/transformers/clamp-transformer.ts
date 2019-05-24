import { clamp, Coordinate } from '@smoovy/utils';

import { ScrollerTransformer } from '../core/transformer';

export class ClampTransformer extends ScrollerTransformer {
  public virtualTransform(position: Coordinate) {
    const wrapperSize = this.dom.getWrapperSize();
    const containerSize = this.dom.getContainerSize();
    const maxScrollX = Math.max(wrapperSize.width - containerSize.width, 0);
    const maxScrollY = Math.max(wrapperSize.height - containerSize.height, 0);

    position.x = clamp(position.x, 0, maxScrollX);
    position.y = clamp(position.y, 0, maxScrollY);
  }

  public outputTransform(
    position: Coordinate,
    update: () => void
  ) {}
}
