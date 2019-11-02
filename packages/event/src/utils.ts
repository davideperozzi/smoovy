export type Unlisten = () => void;

export function listenCompose<T extends Unlisten>(
  ...listeners: T[]
): Unlisten {
  return () => listeners.forEach(cb => cb.call(undefined));
}
