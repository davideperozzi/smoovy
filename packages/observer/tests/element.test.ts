import { ElementObserver, ElementState} from '../src';

describe('element', () => {
  describe('observer', () => {
    beforeEach(() => ElementObserver.reset());

    it('should create a valid state', () => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);

      expect(state).toBeInstanceOf(ElementState);
    });

    it('should retrieve the same state for the same element', () => {
      const element = document.createElement('div');
      const state1 = ElementObserver.observe(element);
      const state2 = ElementObserver.observe(element);

      expect(state1).toBe(state2);
    });

    it('should destroy a state properly', () => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);
      const destroyFn = jest.fn();

      state.onDestroy(destroyFn);
      state.destroy();

      expect(destroyFn).toHaveBeenCalledTimes(1);
      expect(state.destroyed).toBe(true);
    });

    it('should force-update the state', () => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);
      const updateFn = jest.fn();

      state.update();
      state.changed(updateFn);
      state.update(false, true);
      state.update(false, true);

      expect(updateFn).toHaveBeenCalledTimes(2);
    });

    it('should async-update the state', (done) => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);
      const updateFn = jest.fn();

      state.changed(updateFn);
      state.update(true, true);
      state.update(true, true);

      expect(updateFn).toHaveBeenCalledTimes(0);

      setTimeout(() => {
        expect(updateFn).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should remove the change-listener', () => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);
      const updateFn = jest.fn();
      const listener = state.changed(updateFn);

      state.update(false, true);
      listener.remove();
      state.update(false, true);

      expect(updateFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle the change-callback', (done) => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);
      const updateFn = jest.fn();

      state.changed(updateFn, 100);
      state.update(false, true); // Should trigger here
      state.update(false, true); // Should ignored
      state.update(false, true); // Should ignored
      state.update(false, true); // Should ignored
      state.update(false, true); // Should trigger here

      setTimeout(() => {
        expect(updateFn).toHaveBeenCalledTimes(2);
        done();
      }, 120);
    });

    it('should detach if no more states', (done) => {
      const element = document.createElement('div');
      const state = ElementObserver.observe(element);

      state.destroy();

      setTimeout(() => {
        expect((ElementObserver.default as any).attached).toBe(false);
        done();
      });
    });

    it('should create a new element observer', () => {
      const element = document.createElement('div');
      const observer = new ElementObserver();
      const state = observer.observe(element);
      const updateFn = jest.fn();
      const destroyFn = jest.fn();

      state.changed(updateFn);
      state.onDestroy(destroyFn);
      state.update(false, true);
      state.update(false, true);
      state.destroy();

      expect(updateFn).toHaveBeenCalledTimes(2);
      expect(destroyFn).toHaveBeenCalledTimes(1);
    });
  });
});
