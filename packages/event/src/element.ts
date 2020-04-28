import { Unlisten } from './utils';

export function listenEl(
  element: HTMLElement | Document | Window,
  type: string | string[],
  listener: (event: any) => any,
  options?: boolean | AddEventListenerOptions
): Unlisten {
  /* istanbul ignore else */
  if (typeof type === 'string') {
    type = [ type ];
  }

  type.forEach(t => element.addEventListener(t, listener, options));

  return () => (type as string[]).forEach(t => {
    element.removeEventListener(t, listener, options);
  });
}
