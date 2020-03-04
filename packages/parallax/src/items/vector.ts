import { objectDeepMerge, Coordinate } from '@smoovy/utils';

import { ParallaxItem, ParallaxItemConfig } from '../item';
import { ParallaxControllerState } from '../state';

export class VectorParallaxItem implements ParallaxItem {
  protected position: Coordinate = { x: 0, y: 0 };
  protected progress = 0;
  protected config: ParallaxItemConfig = {
    speed: { x: 0, y: 0 },
    offset: { x: 0.5, y: 0.5 },
    state: this.state.bind(this)
  };

  public constructor(
    config: Partial<ParallaxItemConfig> = {}
  ) {
    this.config = Object.assign(this.config, config);
  }

  public update(state: ParallaxControllerState, offset: Coordinate) {
    console.log(state, offset);
    const vectorState = this.config.state();

    const viewportCenter = {
      x: state.viewportWidth * offset.x,
      y: state.viewportHeight * offset.y
    };

    const vectorCenter = {
      x: vectorState.x * this.config.offset.x,
      y: vectorState.y * this.config.offset.y
    };

    const vectorOffset = {
      x: Math.max(viewportCenter.x - vectorCenter.x - vectorState.x, 0),
      y: Math.max(viewportCenter.y - vectorCenter.y - vectorState.y, 0)
    };

    const compensation = {
      x: Math.max(
        vectorState.x - (
          state.contentWidth - viewportCenter.x - vectorCenter.x
        ),
        0
      ),
      y: Math.max(
        vectorState.y - (
          state.contentHeight - viewportCenter.y - vectorCenter.y
        ),
        0
      )
    };

    const rawPosition = {
      x: (state.scrollPosX + compensation.x - vectorState.x - vectorOffset.x)
         + viewportCenter.x - vectorCenter.x,
      y: (state.scrollPosY + compensation.y - vectorState.y - vectorOffset.y)
         + viewportCenter.y - vectorCenter.y,
    };

    this.position.x = rawPosition.x * this.config.speed.x;
    this.position.y = rawPosition.y * this.config.speed.y;

    if (this.config.on && typeof this.config.on.update === 'function') {
      this.config.on.update.call(this, this.position, this.progress);
    }
  }

  public destroy() {

  }

  protected state() {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
}
