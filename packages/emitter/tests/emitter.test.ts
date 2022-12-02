import { EventEmitter } from '../src';
import { describe, it, expect, vi } from 'vitest';

describe('emitter', () => {
  const emitter = new EventEmitter();

  it('should emit/receive one event', () => {
    const listener = vi.fn();
    const unlisten = emitter.on('test', listener);

    emitter.emit('test', 1337);
    unlisten();
    emitter.emit('test', 1337);

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(1337);
  });

  it('should emit/receive multiple events', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const unlisten1 = emitter.on('test1', listener1);
    const unlisten2 = emitter.on('test2', listener2);
    const events = { test1: 't1', test2: 't2' };

    emitter.emit(events);
    emitter.emit(events);

    unlisten1();
    unlisten2();

    emitter.emit(events);
    emitter.emit(events);

    expect(listener1).toBeCalledTimes(2);
    expect(listener2).toBeCalledTimes(2);
    expect(listener1).toBeCalledWith(events.test1);
    expect(listener2).toBeCalledWith(events.test2);
  });

  it('should receive data from callbacks', () => {
    const eventName = 'request';
    const emissions = vi.fn();
    const unlisten1 = emitter.on(eventName, (num?) => 'response' + (num || ''));
    const unlisten2 = emitter.on(eventName, (num?) => 'response' + (num || ''));
    const emitEvent = (num: string) => {
      emitter.emit<string>(eventName, num, (data) => {
        expect(data === 'response1' || data === 'response2').toBe(true);
        emissions();
      });

      emitter.emit<string>(eventName, (data) => {
        expect(data).toStrictEqual('response');
        emissions();
      });
    };

    emitEvent('1');
    emitEvent('2');
    unlisten1();
    unlisten2();
    emitEvent('1');

    expect(emissions).toBeCalledTimes(8);
  });

  it('should mute/unmute events', () => {
    const listener = vi.fn();
    const unlisten = emitter.on('test', listener);

    emitter.emit('test');

    const unmute = emitter.muteEvents('test');
    emitter.emit('test');
    emitter.emit('test');
    emitter.emit('test');

    expect(emitter.isEventMuted('test')).toBeTruthy();
    unmute();

    emitter.emit('test');

    unlisten();

    expect(emitter.isEventMuted('test')).toBeFalsy();
    expect(listener).toBeCalledTimes(2);
  });

  it('should detect listener count for events', () => {
    const unlisten1 = emitter.on('test1', () => {});
    const unlisten2 = emitter.on('test1', () => {});
    const unlisten3 = emitter.on('test2', () => {});

    expect(emitter.hasEventListeners('test1')).toBeTruthy();
    expect(emitter.hasEventListeners('test2')).toBeTruthy();

    unlisten1();
    unlisten2();
    unlisten3();

    expect(emitter.hasEventListeners('test1')).toBeFalsy();
    expect(emitter.hasEventListeners('test2')).toBeFalsy();
  });

  it('should reflect events to a separate emitter', () => {
    const listener = vi.fn();
    const emitter2 = new EventEmitter();

    emitter2.on('test', listener);

    emitter.reflectEvents(emitter2);
    emitter.emit('test').emit('test').emit('test');

    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('should return false if no listeners were found (on detach)', () => {
    expect(emitter.off('j4ehfd', () => {})).toBeFalsy();
  });

  it('should reflect events to a separate emitter with muted events', () => {
    const listener = vi.fn();
    const emitter2 = new EventEmitter();

    emitter2.on('test', listener);

    emitter.reflectEvents(emitter2);
    emitter.emit('test');
    emitter.muteEvents('test');
    emitter.emit('test');
    emitter.unmuteEvents('test');

    expect(listener).toHaveBeenCalledTimes(1);

    emitter.emit('test');
    emitter2.muteEvents('test');
    emitter.emit('test');
    emitter2.unmuteEvents('test');

    expect(listener).toHaveBeenCalledTimes(2);

    emitter.emit({ test: 'data' }).emit('test');

    expect(listener).toHaveBeenCalledTimes(4);

    emitter.unreflectEvents();
    emitter.emit({ test: 'data' }).emit('test');

    expect(listener).toHaveBeenCalledTimes(4);
  });
});
