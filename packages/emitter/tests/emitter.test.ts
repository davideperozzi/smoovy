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
});