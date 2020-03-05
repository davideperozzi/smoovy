import { Coordinate } from '@smoovy/utils';

import { ParallaxControllerState, ParallaxItemState } from './state';

export interface ParallaxItemConfig {
  speed: Coordinate | number;
  offset: Coordinate | number;
  state?: () => ParallaxItemState;
  on?: Partial<{
    update: (pos: Coordinate, progress: number) => void,
    destroy: () => void
  }>;
}

export interface ParallaxItem {
  update(state: ParallaxControllerState, offset: Coordinate): void;
  destroy(): void;
}




