import { Unlisten } from './utils';

export function listenEl<K extends keyof HTMLElementEventMap>(
  element: HTMLElement|Window,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listenEl(
  element: HTMLElement|Window,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): Unlisten {
  element.addEventListener(type, listener, options);

  return () => element.removeEventListener(type, listener, options);
}
