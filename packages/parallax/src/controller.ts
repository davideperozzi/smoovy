import { Coordinate, objectDeepMerge } from '@smoovy/utils';

import { ParallaxItem } from './item';
import { ParallaxControllerState } from './state';

export interface ParallaxControllerConfig {
  offset: Coordinate;
}

const defaultState: ParallaxControllerState = {
  scrollPosX: 0,
  scrollPosY: 0,
  viewportWidth: 0,
  viewportHeight: 0,
  contentWidth: 0,
  contentHeight: 0
};

const defaultConfig: ParallaxControllerConfig = {
  offset: { x: 0.5, y: 0.5 }
};

export class ParallaxController {
  protected _items: ParallaxItem[] = [];
  protected config = defaultConfig;
  protected state = defaultState;

  public constructor(config: Partial<ParallaxControllerConfig> = {}) {
    this.config = objectDeepMerge(this.config, config);
  }

  public get items() {
    return this._items;
  }

  public add(item: ParallaxItem) {
    if ( ! this._items.includes(item)) {
      this._items.push(item);
    }
  }

  public recalc() {
    for (let i = 0, len = this._items.length; i < len; i++) {
      this._items[i].recalc();
    }
  }

  public remove(item: ParallaxItem) {
    const index = this._items.indexOf(item);

    if (index > -1) {
      this._items[index].destroy();
      this._items.splice(index, 1);
    }
  }

  public update(state: Partial<ParallaxControllerState>) {
    if (typeof state.scrollPosX === 'number') {
      this.state.scrollPosX = state.scrollPosX;
    }

    if (typeof state.scrollPosY === 'number') {
      this.state.scrollPosY = state.scrollPosY;
    }

    if (typeof state.viewportWidth === 'number') {
      this.state.viewportWidth = state.viewportWidth;
    }

    if (typeof state.viewportHeight === 'number') {
      this.state.viewportHeight = state.viewportHeight;
    }

    if (typeof state.contentWidth === 'number') {
      this.state.contentWidth = state.contentWidth;
    }

    if (typeof state.contentHeight === 'number') {
      this.state.contentHeight = state.contentHeight;
    }

    for (let i = 0, len = this._items.length; i < len; i++) {
      this._items[i].update(this.state, this.config.offset);
    }
  }
}
