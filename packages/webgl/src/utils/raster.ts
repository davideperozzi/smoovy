import { Coordinate, Size } from '@smoovy/utils';

type WorkerMessage = MessageEvent<{ key: number, vertices: Float32Array }>;

function createWorker() {
  const blob = new Blob([
    `self.onmessage = ({ data: { key, size, amount, posX, posY } }) => {
      const sX = size.width / amount.x;
      const sY = size.height / amount.y;
      const vertices = new Float32Array(12 * amount.x * amount.y);
      let index = 0;

      for (let iY = 0; iY < amount.y; iY++) {
        const y = posY + sY * iY;

        for (let iX = 0; iX < amount.x; iX++) {
          const x = posX + sX * iX;

          vertices.set([
            x,       y + sY,
            x,       y,
            x + sX,  y + sY,
            x + sX,  y,
            x + sX,  y + sY,
            x,       y,
          ], index);

          index += 12;
        }
      }

      self.postMessage({ key, vertices });
    }`.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, ' ').trim()
  ], { type: 'application/javascript' } );

  return new Worker(URL.createObjectURL(blob));
}

let worker: Worker | null = null;

export async function triangulate(
  amount: Coordinate,
  size: Size,
  posX = 0,
  posY = 0
): Promise<Float32Array> {
  return new Promise((resolve) => {
    if (window.Worker) {
      worker = worker || createWorker();
      const key = performance.now() + Math.random();
      const onMsg = (event: WorkerMessage) => {
        if (event.data.key === key) {
          resolve(event.data.vertices);
          worker?.removeEventListener('message', onMsg);
        }
      };

      worker.addEventListener('message', onMsg);
      worker.postMessage({ key, amount, size, posX, posY });
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
