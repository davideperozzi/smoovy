import { Unlisten } from '@smoovy/listener';

export type EventListenerCb<T = any> = (data: T) => void;
export type ListenerCallback<T = any> = (...args: T[]) => void;

export class EventEmitter {
  private listeners: { [name: string]: Set<EventListenerCb> } = {};
  private emitters: EventEmitter[] = [];
  private mutedEvents: string[] = [];

  public emit<T = any, TC = T>(
    eventsOrName: { [name: string]: T } | string,
    dataOrCallback?: T | ListenerCallback<TC>,
    callback?: ListenerCallback<TC>
  ) {
    const listenerCb = typeof dataOrCallback === 'function'
      ? dataOrCallback as ListenerCallback<TC>
      : callback;

    if (typeof eventsOrName === 'string') {
      const name = eventsOrName;

      if ( ! this.isEventMuted(name)) {
        for (let i = 0, len = this.emitters.length; i < len; i++) {
          this.emitters[i].emit(eventsOrName, dataOrCallback, callback);
        }

        if (this.hasListener(name)) {
          this.listeners[name].forEach(cb => {
            const result = cb(
              dataOrCallback !== listenerCb ? dataOrCallback as T : undefined
            ) as any;

            if (listenerCb) {
              listenerCb(result);
            }
          });
        }
      }
    } else {
      const events = eventsOrName;
      const keys = Object.keys(events);

      for (let k = 0, lenK = keys.length; k < lenK; k++) {
        const name = keys[k];
        const eventData = events[name];

        if ( ! this.isEventMuted(name)) {
          for (let i = 0, len = this.emitters.length; i < len; i++) {
            this.emitters[i].emit(name, eventData, callback);
          }

          if (this.hasListener(name)) {
            this.listeners[name].forEach(cb => {
              const result = cb(eventData) as any;

              if (listenerCb) {
                listenerCb(result);
              }
            });
          }
        }
      }
    }

    return this;
  }

  private hasListener(name: string) {
    return Object.prototype.hasOwnProperty.call(this.listeners, name);
  }

  public on<T>(name: string, cb: EventListenerCb<T>): Unlisten {
    if (this.hasListener(name)) {
      this.listeners[name].add(cb);
    } else {
      this.listeners[name] = new Set([ cb ]);
    }

    return () => this.off(name, cb);
  }

  public off(name: string, cb: EventListenerCb) {
    const listeners = this.listeners;

    if (this.hasListener(name)) {
      return listeners[name].delete(cb);
    }

    return false;
  }

  public hasEventListeners(name: string) {
    return this.listeners[name] && this.listeners[name].size > 0;
  }

  public isEventMuted(event: string) {
    return this.mutedEvents.includes(event);
  }

  public muteEvents(...events: (string|boolean)[]): Unlisten {
    events.forEach(event => {
      if (typeof event === 'string' && ! this.mutedEvents.includes(event)) {
        this.mutedEvents.push(event);
      }
    });

    return () => this.unmuteEvents(...events);
  }

  public unmuteEvents(...events: (string|boolean)[]) {
    events.forEach(event => {
      if (typeof event === 'string') {
        const index = this.mutedEvents.indexOf(event);

        if (index > -1) {
          this.mutedEvents.splice(index, 1);
        }
      }
    });
  }

  public reflectEvents(...emitters: EventEmitter[]) {
    this.emitters = emitters;
  }

  public unreflectEvents() {
    this.emitters = [];
  }
}
