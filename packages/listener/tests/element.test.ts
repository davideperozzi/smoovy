import { listen } from '../src';
import { describe, it, expect, vi } from 'vitest';

describe('element', () => {
  it('should listen to a specific event', () => {
    const div = document.createElement('div');
    const fn = vi.fn();

    listen(div, 'focus', fn);

    div.dispatchEvent(new Event('focus'));
    div.dispatchEvent(new Event('focus'));

    expect(fn).toBeCalledTimes(2);
  });

  it('should listen to a specific event and unlisten', () => {
    const div = document.createElement('div');
    const fn = vi.fn();

    const unlisten = listen(div, 'focus', fn);

    div.dispatchEvent(new Event('focus'));
    div.dispatchEvent(new Event('focus'));

    expect(fn).toBeCalledTimes(2);
    unlisten();
    div.dispatchEvent(new Event('focus'));
    div.dispatchEvent(new Event('focus'));
    expect(fn).toBeCalledTimes(2);
  });

  it('should listen to custom events', () => {
    const div = document.createElement('div');
    const fn = vi.fn();

    listen(div, [ 'custom1', 'custom2' ], fn);

    div.dispatchEvent(new CustomEvent('custom1'));
    div.dispatchEvent(new CustomEvent('custom2'));

    expect(fn).toBeCalledTimes(2);
  });
});
