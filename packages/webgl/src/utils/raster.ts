import { Coordinate, Size } from '@smoovy/utils';

type WorkerMessage = MessageEvent<Float32Array>;

function createWorker() {
  const blob = new Blob([
    `self.onmessage = ({ data: { size, amount, posX, posY } }) => {
      const sX = size.width / amount.x;
      const sY = size.height / amount.y;
      const vertices = new Float32Array(12 * amount.x * amount.y);
      let index = 0;

      for (let iY = 0; iY < amount.y; iY++) {
        const y = posY + sY * iY;

        for (let iX = 0; iX < amount.x; iX++) {
          const x = posX + sX * iX;

          vertices.set([
            // top-left triangle
            x,       y + sY, // top-left corner     = 0, 1
            x,       y,      // bottom-left corner  = 0, 0
            x + sX,  y + sY, // top-right corner    = 1, 1
            // bottom-right triangle
            x + sX,  y,      // bottom-right corner = 1, 0
            x + sX,  y + sY, // top-right corner    = 1, 1
            x,       y,      // bottom-left corner  = 0, 0
          ], index);

          index += 12;
        }
      }

      self.postMessage(vertices);
    }`
  ], { type: 'application/javascript' } );

  return new Worker(URL.createObjectURL(blob));
}

export async function triangulate(
  amount: Coordinate,
  size: Size,
  posX = 0,
  posY = 0
): Promise<Float32Array> {
  return new Promise((resolve) => {
    if (window.Worker) {
      const worker = createWorker();

      worker.onmessage = (event: WorkerMessage) => {
        resolve(event.data);
        worker?.terminate();
      };

      worker.postMessage({ amount, size, posX, posY });
    } else {
      const sX = size.width / amount.x;
      const sY = size.height / amount.y;
      const vertices = new Float32Array(12 * amount.x * amount.y);
      let index = 0;

      for (let iY = 0; iY < amount.y; iY++) {
        const y = posY + sY * iY;

        for (let iX = 0; iX < amount.x; iX++) {
          const x = posX + sX * iX;

          vertices.set([
            // top-left triangle
            x,       y + sY, // top-left corner     = 0, 1
            x,       y,      // bottom-left corner  = 0, 0
            x + sX,  y + sY, // top-right corner    = 1, 1
            // bottom-right triangle
            x + sX,  y,      // bottom-right corner = 1, 0
            x + sX,  y + sY, // top-right corner    = 1, 1
            x,       y,      // bottom-left corner  = 0, 0
          ], index);

          index += 12;
        }
      }

      resolve(vertices);
    }
  });
}
