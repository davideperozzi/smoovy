import { Unlisten } from './utils';

export type EventListenerCb<T = any> = (data: T) => void;
export type ListenerCallback<T = any> = (...args: T[]) => void;

export class EventEmitter {
  private listeners: { [name: string]: EventListenerCb[] } = {};
  private mutedEvents: string[] = [];

  public emit<T = any, TC = T>(
    eventsOrName: { [name: string]: T } | string,
    dataOrCallback?: T | ListenerCallback<TC>,
    callback: ListenerCallback<TC> = () => {}
  ) {
    const listnerCallback = typeof dataOrCallback === 'function'
      ? dataOrCallback as ListenerCallback<TC>
      : callback;

    if (typeof eventsOrName === 'string') {
      const name = eventsOrName;

      if (this.listeners.hasOwnProperty(name) && ! this.isEventMuted(name)) {
        for (let i = 0, len = this.listeners[name].length; i < len; i++) {
          listnerCallback.call(
            this,
            this.listeners[name][i].call(this, dataOrCallback as T) as any
          );
        }
      }
    } else {
      const events = eventsOrName;
      const keys = Object.keys(events);

      for (let k = 0, lenK = keys.length; k < lenK; k++) {
        const name = keys[k];
        const eventData = events[name];

        if (this.listeners.hasOwnProperty(name) && ! this.isEventMuted(name)) {
          for (let i = 0, len = this.listeners[name].length; i < len; i++) {
            listnerCallback.call(
              this,
              this.listeners[name][i].call(this, eventData) as any
            );
          }
        }
      }
    }
  }

  public on<T>(name: string, cb: EventListenerCb<T>): Unlisten {
    if (this.listeners.hasOwnProperty(name)) {
      this.listeners[name].push(cb);
    } else {
      this.listeners[name] = [ cb ];
    }

    return () => this.off(name, cb);
  }

  public off(name: string, cb: EventListenerCb) {
    const listeners = this.listeners;

    if (listeners.hasOwnProperty(name)) {
      const index = listeners[name].indexOf(cb);

      if (index > -1) {
        listeners[name].splice(index, 1);
      }
    }
  }

  public hasEventListeners(name: string) {
    return this.listeners[name] && this.listeners[name].length > 0;
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
}
