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
  obj: Document,
  type: (K | string) | (K | string)[],
  listener: (event: WindowEventMap[K]) => any,
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