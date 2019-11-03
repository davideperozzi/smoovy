import { listenCompose } from '../src';

describe('utils', () => {
  it('should compose multiple listeners to one', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const unlisten = listenCompose(listener1, listener2);

    expect(listener1).toBeCalledTimes(0);
    expect(listener2).toBeCalledTimes(0);

    unlisten();

    expect(listener1).toBeCalledTimes(1);
    expect(listener2).toBeCalledTimes(1);
  });
});
