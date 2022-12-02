import { Unlisten } from './unlisten';

export function listenCompose<T extends Unlisten | undefined>(
  ...listeners: T[]
): Unlisten {
  return () => listeners.forEach(cb => typeof cb === 'function' && cb());
}