import { listenEl } from '../src';

describe('element', () => {
  it('should listen to a specific event', () => {
    const div = document.createElement('div');
    const fn = jest.fn();

    listenEl(div, 'focus', fn);

    div.dispatchEvent(new Event('focus'));
    div.dispatchEvent(new Event('focus'));

    expect(fn).toBeCalledTimes(2);
  });

  it('should listen to a specific event and unlisten', () => {
    const div = document.createElement('div');
    const fn = jest.fn();

    const unlisten = listenEl(div, 'focus', fn);

    div.dispatchEvent(new Event('focus'));
    div.dispatchEvent(new Event('focus'));

    expect(fn).toBeCalledTimes(2);
    unlisten();
    div.dispatchEvent(new Event('focus'));
    div.dispatchEvent(new Event('focus'));
    expect(fn).toBeCalledTimes(2);
  });
});
