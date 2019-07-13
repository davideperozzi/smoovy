import { throttle } from '../src';

describe('general', () => {
  it('should throttle function (50ms)', (done) => {
    let counter = 0;
    const throttled = throttle(() => counter++, 50);

    throttled();
    throttled();
    throttled();

    setTimeout(() => {
      expect(counter).toBe(2);
      done();
    }, 120);
  });

  it('should throttle function (0ms - default)', (done) => {
    let counter = 0;
    const throttled = throttle(() => counter++);

    throttled();
    throttled();
    throttled();

    setTimeout(() => {
      expect(counter).toBe(3);
      done();
    }, 10);
  });
});
