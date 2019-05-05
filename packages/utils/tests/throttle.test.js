import { throttle } from '../dist';

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
});
