import { Unlisten } from '@smoovy/listener';

export type EventListener<T = any> = (event: T) => void;

export class EventEmitter<EventMap extends Record<string, any> = any> {
  private listeners: Map<keyof EventMap, Set<EventListener>> = new Map();
  private emitters: EventEmitter[] = [];

  emit<K extends keyof EventMap>(name: K, event?: EventMap[K]) {
    const listeners = this.listeners.get(name);

    if (listeners) {
      listeners.forEach(cb => cb(event));
    }

    for (const emitter of this.emitters) {
      emitter.emit(name, event);
    }

    return this;
  }

  on<K extends keyof EventMap>(name: K, cb: EventListener<EventMap[K]>): Unlisten {
    let listeners = this.listeners.get(name);

    if ( ! listeners) {
      listeners = new Set();

      this.listeners.set(name, listeners);
    }

    listeners.add(cb);

    return () => this.off(name, cb);
  }

  off<K extends keyof EventMap>(name: K, cb: EventListener<EventMap[K]>) {
    const listeners = this.listeners.get(name);

    if (listeners) {
      return listeners.delete(cb);
    }

    return false;
  }

  hasEventListeners<K extends keyof EventMap>(name: K) {
    const listeners = this.listeners.get(name);

    return !!listeners && listeners.size > 0;
  }

  reflectEvents(...emitters: EventEmitter[]) {
    this.emitters = emitters;
  }

  unreflectEvents() {
    this.emitters = [];
  }
}