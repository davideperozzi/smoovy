import { Coordinate, Size } from '@smoovy/utils';

export interface ParallaxControllerState {
  scrollPosX: number;
  scrollPosY: number;
  viewportWidth: number;
  viewportHeight: number;
  contentWidth: number;
  contentHeight: number;
}

export interface ParallaxItemState extends Coordinate, Size {}
