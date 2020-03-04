import { Coordinate, Size } from '@smoovy/utils';

import { ParallaxControllerState } from './state';

export interface ParallaxItemState extends Coordinate, Size {}

export enum ParallaxItemEvent {
  UPDATE = 'update'
}

export interface ParallaxItemConfig {
  speed: Coordinate;
  offset: Coordinate;
  state: () => ParallaxItemState;
  on?: Partial<{
    update: (pos: Coordinate, progress: number) => void
  }>;
}

export interface ParallaxItem {
  update(state: ParallaxControllerState, offset: Coordinate): void;
  destroy(): void;
}




