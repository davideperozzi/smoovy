export interface ParallaxState {
  x: number;
  y: number;
  width: number;
  height: number;
  shiftX: number;
  shiftY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  scrollX: number;
  scrollY: number;
  viewWidth: number;
  viewHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export const createState = () => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  shiftX: 0,
  shiftY: 0,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  scrollX: 0,
  scrollY: 0,
  viewWidth: 0,
  viewHeight: 0,
  maxWidth: 0,
  maxHeight: 0
} as ParallaxState)