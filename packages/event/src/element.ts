export function listenEl<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void;
export function listenEl(
  element: HTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  element.addEventListener(type, listener, options);

  return () => element.removeEventListener(type, listener, options);
}

export function listenCompose(
  ...listeners: ReturnType<typeof listenEl>[]
) {
  return () => listeners.forEach(cb => cb.call(undefined));
}
