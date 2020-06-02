import { throttle } from '@smoovy/utils';

import {
  defaultController, ObservableController, observe, unobserve,
} from '../src';

describe('element', () => {
  describe('observable', () => {
    beforeEach(() => defaultController.reset());

    it('should create a valid observable', () => {
      const element = document.createElement('div');
      const observable = observe(element);

      expect(observable).toBeInstanceOf(Object);
    });

    it('should delete an observable properly', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const destroyFn = jest.fn();

      observable.onDetach(destroyFn);
      unobserve(observable);

      expect(destroyFn).toHaveBeenCalledTimes(1);
    });

    it('should update the observable', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const updateFn = jest.fn();

      observable.onUpdate(updateFn);
      observable.update();
      observable.update();

      expect(updateFn).toHaveBeenCalledTimes(2);
    });

    it('should remove the update-listener', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const updateFn = jest.fn();
      const listener = observable.onUpdate(updateFn);

      observable.update();
      listener();
      observable.update();

      expect(updateFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle the update-callback', (done) => {
      const element = document.createElement('div');
      const observable = observe(element);
      const updateFn = jest.fn();

      observable.onUpdate(throttle(updateFn, 100));
      observable.update(); // Should trigger here
      observable.update(); // Should ignored
      observable.update(); // Should ignored
      observable.update(); // Should ignored
      observable.update(); // Should trigger here

      setTimeout(() => {
        expect(updateFn).toHaveBeenCalledTimes(2);
        done();
      }, 120);
    });

    it('should detach if no more observables', (done) => {
      const element = document.createElement('div');
      const observable = observe(element);

      expect(defaultController.active).toBe(true);
      unobserve(observable);
      expect(defaultController.active).toBe(false);
      done();
    });

    it('should create a new element observer', (done) => {
      const element = document.createElement('div');
      const controller = new ObservableController();
      const observable = observe(element, controller);
      const updateFn = jest.fn();
      const deleteFn = jest.fn();

      observable.onUpdate(updateFn);
      observable.onDetach(deleteFn);
      observable.update();
      observable.update();
      unobserve(observable);

      expect(updateFn).toHaveBeenCalledTimes(2);
      expect(deleteFn).toHaveBeenCalledTimes(1);
      done();
    });

    it('should determine if element is in viewport', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const vpSize = { width: 1920, height: 1080 };

      observable.offset.x = 100;
      observable.offset.y = 100;
      observable.offset.width = 100;
      observable.offset.height = 100;

      const vpSy50 = observable.prepos({ x: 0, y: 50 }, vpSize);
      const vpSy500 = observable.prepos({ x: 0, y: 500 }, vpSize);
      const vpSx500 = observable.prepos({ x: 500, y: 0 }, vpSize);
      const vpSxM1920 = observable.prepos({ x: -1920, y: 0 }, vpSize);

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

      observable.offset.y = 3000;

      const vpSy0 = observable.prepos({ x: 0, y: 0 }, vpSize);

      expect(vpSy0.inside).toBe(false);
      expect(vpSy0.left).toBe(false);
      expect(vpSy0.right).toBe(false);
      expect(vpSy0.above).toBe(false);
      expect(vpSy0.below).toBe(true);

      observable.offset.x = vpSize.width;
      observable.offset.y = vpSize.height;

      const vpOy50Sy49 = observable.prepos(
        { x: 0, y: 49 }, vpSize, { x: 0, y: -50 }
      );

      const vpOy50Sy50 = observable.prepos(
        { x: 0, y: 50 }, vpSize, { x: 0, y: -50 }
      );

      expect(vpOy50Sy49.inside).toBe(false);
      expect(vpOy50Sy50.inside).toBe(true);
    });
  });
});
