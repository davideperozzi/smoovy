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
      const state3 = ElementObserver.observe(new ElementState(state2));

      expect(state1).toBe(state2);
      expect(state2.element).toBe(state3.element);
    });

    it('should retrieve the same state for the same state', () => {
      const element = document.createElement('div');
      const state1 = ElementObserver.observe(element);
      const state2 = ElementObserver.observe(state1);

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

    it('should determine if element is in viewport', () => {
      const element = document.createElement('div');
      const observer = new ElementObserver();
      const state = observer.observe(element);
      const vpSize = { width: 1920, height: 1080 };

      state.offset.x = 100;
      state.offset.y = 100;
      state.size.width = 100;
      state.size.height = 100;

      const vpSy50 = state.inViewport({ x: 0, y: 50 }, vpSize);
      const vpSy500 = state.inViewport({ x: 0, y: 500 }, vpSize);
      const vpSx500 = state.inViewport({ x: 500, y: 0 }, vpSize);
      const vpSxM1920 = state.inViewport({ x: -1920, y: 0 }, vpSize);

      expect(vpSy50.inside).toBe(true);
      expect(vpSy50.left).toBe(false);
      expect(vpSy50.right).toBe(false);
      expect(vpSy50.above).toBe(false);
      expect(vpSy50.below).toBe(false);

      expect(vpSy500.inside).toBe(false);
      expect(vpSy500.above).toBe(true);
      expect(vpSy500.below).toBe(false);
      expect(vpSy500.left).toBe(false);
      expect(vpSy500.right).toBe(false);

      expect(vpSx500.inside).toBe(false);
      expect(vpSx500.above).toBe(false);
      expect(vpSx500.below).toBe(false);
      expect(vpSx500.left).toBe(true);
      expect(vpSx500.right).toBe(false);

      expect(vpSxM1920.inside).toBe(false);
      expect(vpSxM1920.above).toBe(false);
      expect(vpSxM1920.below).toBe(false);
      expect(vpSxM1920.left).toBe(false);
      expect(vpSxM1920.right).toBe(true);

      state.offset.y = 3000;

      const vpSy0 = state.inViewport({ x: 0, y: 0 }, vpSize);

      expect(vpSy0.inside).toBe(false);
      expect(vpSy0.left).toBe(false);
      expect(vpSy0.right).toBe(false);
      expect(vpSy0.above).toBe(false);
      expect(vpSy0.below).toBe(true);

      state.offset.x = vpSize.width;
      state.offset.y = vpSize.height;

      const vpOy50Sy49 = state.inViewport(
        { x: 0, y: 49 }, vpSize, { x: 0, y: -50 }
      );

      const vpOy50Sy50 = state.inViewport(
        { x: 0, y: 50 }, vpSize, { x: 0, y: -50 }
      );

      expect(vpOy50Sy49.inside).toBe(false);
      expect(vpOy50Sy50.inside).toBe(true);
    });
  });
});
