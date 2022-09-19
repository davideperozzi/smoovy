import { Coordinate } from '@smoovy/utils';

import { ParallaxItem, ParallaxItemConfig } from '../item';
import { ParallaxControllerState } from '../state';

export interface VectorParallaxItemConfig extends ParallaxItemConfig {
  normalize: boolean;
}

export class VectorParallaxItem<
  C extends VectorParallaxItemConfig = VectorParallaxItemConfig
> implements ParallaxItem {
  protected shift: Coordinate = { x: 0, y: 0 };
  protected staticProgress: Coordinate = { x: 0, y: 0 };
  /**
   * @todo Find formula for dynamic progress.
   *
   * Dynamic progress = the progress which respects the shift value.
   * The static progress is used to determine the progress
   * without the shift
   */
  protected dynamicProgress: Coordinate = { x: 0, y: 0 };
  protected config = {
    normalize: true,
    speed: { x: 0, y: 0 },
    offset: { x: 0.5, y: 0.5 }
  } as C;

  public constructor(
    config: Partial<C> = {}
  ) {
    this.config = Object.assign(this.config, config);
  }

  protected get offset() {
    return {
      x: typeof this.config.offset === 'number'
            ? this.config.offset
            : this.config.offset.x,
      y: typeof this.config.offset === 'number'
            ? this.config.offset
            : this.config.offset.y
    };
  }

  protected get speed() {
    return {
      x: typeof this.config.speed === 'number'
            ? this.config.speed
            : this.config.speed.x,
      y: typeof this.config.speed === 'number'
            ? this.config.speed
            : this.config.speed.y
    };
  }

  public update(
    ctrlState: ParallaxControllerState,
    ctrlOffset: Coordinate
  ) {
    const vecState = this.getState();

    // Get mid values
    const viewMidX = ctrlState.viewportWidth * ctrlOffset.x;
    const viewMidY = ctrlState.viewportHeight * ctrlOffset.y;
    const vecMidX = vecState.width * this.offset.x;
    const vecMidY = vecState.height * this.offset.y;

    // Get static progress
    const tDiffX = Math.max(ctrlState.viewportWidth - vecState.x, 0);
    const tDiffY = Math.max(ctrlState.viewportHeight - vecState.y, 0);
    const tMaxX = ctrlState.viewportWidth + vecState.width - tDiffX;
    const tMaxY = ctrlState.viewportHeight + vecState.height - tDiffY;

    let progressCountX = ctrlState.scrollPosX - tDiffX;
    progressCountX = progressCountX - vecState.x + ctrlState.viewportWidth;

    let progressCountY = ctrlState.scrollPosY - tDiffY;
    progressCountY = progressCountY - vecState.y + ctrlState.viewportHeight;

    this.staticProgress.x = progressCountX / tMaxX;
    this.staticProgress.y = progressCountY / tMaxY;

    // Normalization for the shift value
    let shiftNormX = 0;
    let shiftNormY = 0;

    if (true === this.config.normalize) {
      const heightDiff = ctrlState.contentHeight - ctrlState.viewportHeight;
      const widthDiff = ctrlState.contentHeight - ctrlState.viewportHeight;

      if (vecState.x < ctrlState.viewportWidth) {
        shiftNormX = viewMidX - vecMidX - vecState.x;
      }

      if (vecState.y < ctrlState.viewportHeight) {
        shiftNormY = viewMidY - vecMidY - vecState.y;
      }

      if (
        vecState.y > heightDiff ||
        vecState.y + vecState.height > heightDiff
      ) {
        shiftNormY = -(viewMidY - vecMidY);
      }

      if (vecState.x > widthDiff || vecState.x + vecState.width > widthDiff) {
        shiftNormX = -(viewMidX - vecMidX);
      }
    }

    // Calculate the shift value
    const moveX = ctrlState.scrollPosX - shiftNormX;
    const moveY = ctrlState.scrollPosY - shiftNormY;

    this.shift.x = (moveX + viewMidX - vecState.x - vecMidX) * this.speed.x;
    this.shift.y = (moveY + viewMidY - vecState.y - vecMidY) * this.speed.y;

    this.onUpdate(ctrlState, ctrlOffset);

    if (this.config.on && typeof this.config.on.update === 'function') {
      this.config.on.update.call(this, this.shift, this.staticProgress);
    }
  }

  public recalc() {
    if (this.config.on && typeof this.config.on.recalc === 'function') {
      this.config.on.recalc.call(this);
    }
  }

  public destroy() {
    if (this.config.on && typeof this.config.on.destroy === 'function') {
      this.config.on.destroy.call(this);
    }
  }

  protected onUpdate(
    constrollerState: ParallaxControllerState,
    controllerOffset: Coordinate
  ) {}

  protected getState() {
    return this.config.state
      ? this.config.state.call(this)
      : { x: 0, y: 0, width: 0, height: 0 };
  }
}
