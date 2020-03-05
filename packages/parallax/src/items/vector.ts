import { Coordinate } from '@smoovy/utils';

import { ParallaxItem, ParallaxItemConfig } from '../item';
import { ParallaxControllerState } from '../state';

export interface VectorParallaxItemConfig extends ParallaxItemConfig {
  normalize: boolean;
}

export class VectorParallaxItem<
  C extends VectorParallaxItemConfig = VectorParallaxItemConfig
> implements ParallaxItem {
  protected position: Coordinate = { x: 0, y: 0 };
  protected progress = 0;
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
    controllerState: ParallaxControllerState,
    controllerOffset: Coordinate
  ) {
    const vectorState = this.getState();

    const viewportCenter = {
      x: controllerState.viewportWidth * controllerOffset.x,
      y: controllerState.viewportHeight * controllerOffset.y
    };

    const vectorCenter = {
      x: vectorState.width * this.offset.x,
      y: vectorState.height * this.offset.y
    };

    const normalize = { x: 0, y: 0 };

    if (true === this.config.normalize) {
      if (vectorState.x < controllerState.viewportWidth) {
        normalize.x = viewportCenter.x - vectorCenter.x - vectorState.x;
      }

      if (vectorState.y < controllerState.viewportHeight) {
        normalize.y = viewportCenter.y - vectorCenter.y - vectorState.y;
      }
    }

    const position = {
      x: controllerState.scrollPosX - normalize.x,
      y: controllerState.scrollPosY - normalize.y
    };

    position.x = position.x - vectorState.x - vectorCenter.x + viewportCenter.x;
    position.y = position.y - vectorState.y - vectorCenter.y + viewportCenter.y;

    this.position.x = position.x * this.speed.x;
    this.position.y = position.y * this.speed.y;

    this.onUpdate(controllerState, controllerOffset);

    if (this.config.on && typeof this.config.on.update === 'function') {
      this.config.on.update.call(this, this.position, this.progress);
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
