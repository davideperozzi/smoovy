import { Coordinate } from '@smoovy/utils';

export function getDeltaByKeyEvent(
  event: KeyboardEvent,
  arrowDelta = 100,
  pageDelta = 250,
  spaceDelta = 200,
  homeEndDelta = Infinity
) {
  const delta: Coordinate = { x: 0, y: 0 };

  switch (event.key) {
    case ' ':
      delta.y = -spaceDelta;
      break;

    case 'ArrowLeft':
      delta.x = arrowDelta;
      break;

    case 'ArrowRight':
      delta.x = -arrowDelta;
      break;

    case 'ArrowDown':
      delta.y = -arrowDelta;
      break;

    case 'ArrowUp':
      delta.y = arrowDelta;
      break;

    case 'PageDown':
      delta.y = -pageDelta;
      break;

    case 'PageUp':
      delta.y = pageDelta;
      break;

    case 'Home':
      delta.y = homeEndDelta;
      break;

    case 'End':
      delta.y = -homeEndDelta;
      break;
  }

  return delta;
}
