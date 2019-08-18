import { ViewportObserver } from '../src';

describe('viewport', () => {
  describe('observer', () => {
    it('should retrieve the default state', async () => {
      ViewportObserver.update();

      const state = await ViewportObserver.state;

      expect(state.width).toBe(1024);
      expect(state.height).toBe(768);

      return Promise.resolve();
    });

    it('should attach & detach', async () => {
      ViewportObserver.update(true);

      const changedFn = jest.fn();
      const listener = ViewportObserver.changed(changedFn);

      ViewportObserver.update(true);
      requestAnimationFrame(() => ViewportObserver.update(true));

      expect(ViewportObserver.attached).toBe(true);

      await new Promise((resolve) => {
        setTimeout(() => {
          listener.remove();
          expect(changedFn).toHaveBeenCalledTimes(2);
          expect(ViewportObserver.attached).toBe(false);
          resolve();
        }, 50);
      });
    });

    it('should updated throttled and detach', async () => {
      const changedFn = jest.fn();
      const listener = ViewportObserver.changed(changedFn, 50);

      ViewportObserver.update(true);
      ViewportObserver.update(true);
      ViewportObserver.update(true);
      ViewportObserver.update(true);

      await new Promise((resolve) => {
        setTimeout(() => {
          expect(changedFn).toHaveBeenCalledTimes(1);
          listener.remove();
          expect(ViewportObserver.attached).toBe(false);
          resolve();
        }, 100);
      });
    });

    it('should update silently', async () => {
      const changedFn = jest.fn();
      const listener = ViewportObserver.changed(changedFn);

      ViewportObserver.update(true, true);
      ViewportObserver.update(true, true);
      ViewportObserver.update(true, true);

      await new Promise((resolve) => {
        setTimeout(() => {
          listener.remove();
          expect(changedFn).toHaveBeenCalledTimes(0);
          resolve();
        }, 50);
      });
    });
  });
});
