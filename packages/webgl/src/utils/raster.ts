import { Coordinate, Size } from '@smoovy/utils';

export function triangulate(
  amount: Coordinate,
  size: Size,
  posX = 0,
  posY = 0
) {
  const sX = size.width / amount.x;
  const sY = size.height / amount.y;
  const vertices: number[] = [];

  for (let iY = 0; iY < amount.y; iY++) {
    const y = posY + sY * iY;

    for (let iX = 0; iX < amount.x; iX++) {
      const x = posX + sX * iX;

      vertices.push(
        // top-left triangle
        x,       y + sY, // top-left corner     = 0, 1
        x,       y,      // bottom-left corner  = 0, 0
        x + sX,  y + sY, // top-right corner    = 1, 1
        // bottom-right triangle
        x + sX,  y,      // bottom-right corner = 1, 0
        x + sX,  y + sY, // top-right corner    = 1, 1
        x,       y,      // bottom-left corner  = 0, 0
      );
    }
  }

  return vertices;
}
