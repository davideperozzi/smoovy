import { Unlisten } from './unlisten';

export function listen<K extends keyof HTMLElementEventMap>(
  obj: HTMLElement,
  type: (K | string) | (K | string)[],
  listener: (event: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listen<K extends keyof DocumentEventMap>(
  obj: Document,
  type: (K | string) | (K | string)[],
  listener: (event: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listen<K extends keyof WindowEventMap>(
  obj: Window,
  type: (K | string) | (K | string)[],
  listener: (event: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listen<
  K extends keyof (HTMLElementEventMap | DocumentEventMap | WindowEventMap)
>(
  obj: HTMLElement | Window | Document,
  type: (K | string) | (K | string)[],
  listener: (
    event: (HTMLElementEventMap | DocumentEventMap | WindowEventMap)[K]
  ) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listen(
  obj: any,
  type: any,
  listener: (event: any) => any,
  options?: any
): any {
  if (typeof type === 'string') {
    type = [ type ];
  }

  type.forEach((t: any) => obj.addEventListener(t, listener, options));

  return () => (type as any[]).forEach(t => {
    obj.removeEventListener(t, listener, options);
  });
}

export function listenOnce<K extends keyof HTMLElementEventMap>(
  obj: HTMLElement,
  type: (K | string) | (K | string)[],
  listener: (event: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listenOnce<K extends keyof DocumentEventMap>(
  obj: Document,
  type: (K | string) | (K | string)[],
  listener: (event: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listenOnce<K extends keyof WindowEventMap>(
  obj: Window,
  type: (K | string) | (K | string)[],
  listener: (event: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listenOnce<
  K extends keyof (HTMLElementEventMap | DocumentEventMap | WindowEventMap)
>(
  obj: HTMLElement | Window | Document,
  type: (K | string) | (K | string)[],
  listener: (
    event: (HTMLElementEventMap | DocumentEventMap | WindowEventMap)[K]
  ) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten;
export function listenOnce(
  obj: any,
  type: any,
  listener: (event: any) => any,
  options?: any
): any {
  const unlisten = listen(obj, type, (...args) => {
    listener(...args);
    unlisten();
  }, options);

  return unlisten;
}