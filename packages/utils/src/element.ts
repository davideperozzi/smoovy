import { Coordinate } from './dimension';

export function getElementOffset(element: HTMLElement): Coordinate {
  let x = 0;
  let y = 0;

  do {
    x += element.offsetLeft || 0;
    y += element.offsetTop || 0;
    element = element.offsetParent as HTMLElement;
  } while (element);

  return { x, y };
}
