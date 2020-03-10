import { listenCompose, Unlisten } from './utils';

export function listenEl<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Document | Window,
  type: K | K[],
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listenEl(
  element: HTMLElement | Document | Window,
  type: string | string[],
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): Unlisten {
  if (typeof type === 'string') {
    type = [ type ];
  }

  type.forEach(t => element.addEventListener(t, listener, options));

  return () => (type as string[]).forEach(t => {
    element.removeEventListener(t, listener, options);
  });
}
