import { Coordinate, Size } from '@smoovy/utils';

export enum SegmentMode {
  VERTEX = 1,
  TEXTURE = 2
}

export function segmentateSquare(
  amount: Coordinate,
  size: Size,
  pos: Coordinate = { x: 0, y: 0 },
  mode: SegmentMode = SegmentMode.VERTEX
) {
  const sW = amount.x;
  const sH = amount.y;
  const tW = size.width / sW;
  const tH = size.height / sH;
  const nH = mode === SegmentMode.TEXTURE ? tH : -tH;
  const points: number[] = [];

  for (let iY = 0; iY < sH; iY++) {
    const nY = pos.y + (mode === SegmentMode.TEXTURE ? (iY * tH) : (-iY * tH));

    for (let iX = 0; iX < sW; iX++) {
      const nX = pos.x + iX * tW;

      points.push(...[
        nX,      nY + nH,
        nX,      nY,
        nX + tW, nY + nH,

        nX + tW, nY + nH,
        nX,      nY,
        nX + tW, nY
      ]);
    }
  }

  return points;
}
