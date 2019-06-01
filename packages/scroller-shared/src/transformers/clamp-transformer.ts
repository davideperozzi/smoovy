import { ScrollerTransformer } from '@smoovy/scroller-core';
import { clamp, Coordinate } from '@smoovy/utils';

export class ClampTransformer extends ScrollerTransformer {
  public virtualTransform(position: Coordinate) {
    const wrapperSize = this.dom.wrapper.size;
    const containerSize = this.dom.container.size;
    const maxScrollX = Math.max(wrapperSize.width - containerSize.width, 0);
    const maxScrollY = Math.max(wrapperSize.height - containerSize.height, 0);

    position.x = clamp(position.x, 0, maxScrollX);
    position.y = clamp(position.y, 0, maxScrollY);
  }

  public outputTransform(
    position: Coordinate,
    update: () => void,
    complete: () => void
  ) {
    complete();
  }
}
