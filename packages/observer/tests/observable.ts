import { Observable } from '../src';
import { JSDOM } from 'jsdom';
import { describe, it, expect, vi, beforeEach } from 'vitest';


describe('observable', () => {
  describe('observable', () => {
    it('should create a valid observable', () => {
      const element = document.createElement('div');
      const observable = observe(element);

      expect(observable).toBeInstanceOf(Object);
    });

    it('should delete an observable properly', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const destroyFn = vi.fn();

      observable.onDetach(destroyFn);
      unobserve(observable);

      expect(destroyFn).toHaveBeenCalledTimes(1);
    });

    it('should update the observable', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const updateFn = vi.fn();

      observable.onUpdate(updateFn);
      observable.update();
      observable.update();

      expect(updateFn).toHaveBeenCalledTimes(2);
    });

    it('should remove the update-listener', () => {
      const element = document.createElement('div');
      const observable = observe(element);
      const updateFn = vi.fn();
      const listener = observable.onUpdate(updateFn);

      observable.update();
      listener();
      observable.update();

      expect(updateFn).toHaveBeenCalledTimes(1);
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
      const observable = new Observable(element);
      const updateFn = vi.fn();
      const deleteFn = vi.fn();
      const attachFn = vi.fn();

      observable.onAttach(attachFn);
      observable.onDetach(deleteFn);

      controller.add(observable);

      setTimeout(() => {
        observable.onUpdate(updateFn);
        observable.update();
        observable.update();
      }, 100);

      setTimeout(() => {
        controller.delete(observable);
        expect(updateFn).toHaveBeenCalledTimes(2);
        expect(attachFn).toHaveBeenCalled();
        expect(deleteFn).toHaveBeenCalled();
        done();
      }, 200);
    });

    it('should not add an invalid element', () => {
      expect(() => observe(1337 as any)).toThrowError();
    });

    it('should update all observables async', (done) => {
      const updateFn1 = vi.fn();
      const updateFn2 = vi.fn();
      const obs1 = observe(document.createElement('div'));
      const obs2 = observe(document.createElement('div'));

      setTimeout(() => {
        obs1.onUpdate(updateFn1);
        obs2.onUpdate(updateFn2);

        expect(updateFn1).toHaveBeenCalledTimes(0);
        expect(updateFn2).toHaveBeenCalledTimes(0);

        // defaultController.update();

        expect(updateFn1).toHaveBeenCalledTimes(0);
        expect(updateFn2).toHaveBeenCalledTimes(0);

        setTimeout(() => {
          expect(updateFn1).toHaveBeenCalled();
          expect(updateFn2).toHaveBeenCalled();
          done();
        }, 50);
      });
    });

    // it('should update all observables sync', (done) => {
    //   const updateFn1 = vi.fn();
    //   const updateFn2 = vi.fn();
    //   const obs1 = observe(document.createElement('div'));
    //   const obs2 = observe(document.createElement('div'));

    //   setTimeout(() => {
    //     obs1.onUpdate(updateFn1);
    //     obs2.onUpdate(updateFn2);

    //     expect(updateFn1).toHaveBeenCalledTimes(0);
    //     expect(updateFn2).toHaveBeenCalledTimes(0);

    //     expect(updateFn1).toHaveBeenCalled();
    //     expect(updateFn2).toHaveBeenCalled();
    //     done();
    //   });
    // });

    // it('should determine if element is in viewport', () => {
    //   const element = document.createElement('div');
    //   const observable = observe(element);
    //   const vpSize = { width: 1920, height: 1080 };

    //   observable.offset.x = 100;
    //   observable.offset.y = 100;
    //   observable.offset.width = 100;
    //   observable.offset.height = 100;

    //   const vpSy50 = observable.prepos({ x: 0, y: 50 }, vpSize);
    //   const vpSy500 = observable.prepos({ x: 0, y: 500 }, vpSize);
    //   const vpSx500 = observable.prepos({ x: 500, y: 0 }, vpSize);
    //   const vpSxM1920 = observable.prepos({ x: -1920, y: 0 }, vpSize);

    //   expect(vpSy50.inside).toBe(true);
    //   expect(vpSy50.left).toBe(false);
    //   expect(vpSy50.right).toBe(false);
    //   expect(vpSy50.above).toBe(false);
    //   expect(vpSy50.below).toBe(false);

    //   expect(vpSy500.inside).toBe(false);
    //   expect(vpSy500.above).toBe(true);
    //   expect(vpSy500.below).toBe(false);
    //   expect(vpSy500.left).toBe(false);
    //   expect(vpSy500.right).toBe(false);

    //   expect(vpSx500.inside).toBe(false);
    //   expect(vpSx500.above).toBe(false);
    //   expect(vpSx500.below).toBe(false);
    //   expect(vpSx500.left).toBe(true);
    //   expect(vpSx500.right).toBe(false);

    //   expect(vpSxM1920.inside).toBe(false);
    //   expect(vpSxM1920.above).toBe(false);
    //   expect(vpSxM1920.below).toBe(false);
    //   expect(vpSxM1920.left).toBe(false);
    //   expect(vpSxM1920.right).toBe(true);

    //   observable.offset.y = 3000;

    //   const vpSy0 = observable.prepos({ x: 0, y: 0 }, vpSize);

    //   expect(vpSy0.inside).toBe(false);
    //   expect(vpSy0.left).toBe(false);
    //   expect(vpSy0.right).toBe(false);
    //   expect(vpSy0.above).toBe(false);
    //   expect(vpSy0.below).toBe(true);

    //   observable.offset.x = vpSize.width;
    //   observable.offset.y = vpSize.height;

    //   const vpOy50Sy49 = observable.prepos(
    //     { x: 0, y: 49 }, vpSize, { x: 0, y: -50 }
    //   );

    //   const vpOy50Sy50 = observable.prepos(
    //     { x: 0, y: 50 }, vpSize, { x: 0, y: -50 }
    //   );

    //   expect(vpOy50Sy49.inside).toBe(false);
    //   expect(vpOy50Sy50.inside).toBe(true);
    // });
  });
});