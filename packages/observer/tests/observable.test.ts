import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Observable, observe, unobserve } from '../src';

describe('observable', () => {
  Object.defineProperties(window.HTMLElement.prototype, {
    offsetLeft: {
      get: function() {
        return parseFloat(window.getComputedStyle(this).marginLeft) || 0;
      }
    },
    offsetTop: {
      get: function() {
        return parseFloat(window.getComputedStyle(this).marginTop) || 0;
      }
    },
    offsetHeight: {
      get: function() {
        return parseFloat(window.getComputedStyle(this).height) || 0;
      }
    },
    offsetWidth: {
      get: function() {
        return parseFloat(window.getComputedStyle(this).width) || 0;
      }
    }
  });

  beforeEach(() => {
    Observable.items.forEach(
      observables => observables.forEach(observable => unobserve(observable))
    );
  });

  it('should create a valid observable', () => {
    const element = document.createElement('div');
    const observable = observe(element);

    expect(observable).toBeInstanceOf(Object);
  });

  it('should delete an observable properly', () => {
    const element = document.createElement('div');
    const observable = observe(element);

    unobserve(observable);

    expect(Observable.items.size).toBe(0);
  });

  it('should update the observable', () => {
    const element = document.createElement('div');
    const observable = observe(element);
    const updateFn = vi.fn();

    element.style.marginTop = '500px';

    observable.onChange(updateFn);
    observable.update();

    expect(observable.top).toBe(500);
    expect(updateFn).toHaveBeenCalledTimes(1);
  });

  it('should throttle the update method', async () => {
    return new Promise<void>(resolve => {
      const element = document.createElement('div');
      const observable = observe(element);
      const updateFn = vi.fn();

      element.style.marginLeft = '500px';

      observable.onChange(updateFn);
      observable.update();
      observable.update(); // throttled (discarded)

      expect(observable.left).toBe(500);

      setTimeout(() => {
        element.style.marginLeft = '300px';

        observable.update();

        expect(observable.left).toBe(300);
        expect(updateFn).toHaveBeenCalledTimes(2);
        resolve();
      }, 50);
    });
  });

  it('should remove the change-listener', () => {
    const element = document.createElement('div');
    const observable = observe(element);
    const updateFn = vi.fn();
    const listener = observable.onChange(updateFn);

    element.style.marginLeft = '300px';

    observable.update();
    listener();
    observable.update();

    expect(updateFn).toHaveBeenCalledTimes(1);
  });

  it('should not add an invalid element', () => {
    expect(() => observe(1337 as any)).toThrowError();
  });

  it('should update all observables async', async () => {
    return new Promise<void>(resolve => {
      const updateFn1 = vi.fn();
      const updateFn2 = vi.fn();
      const obs1 = observe(document.createElement('div'));
      const obs2 = observe(document.createElement('div'));

      setTimeout(() => {
        obs1.onChange(updateFn1);
        obs2.onChange(updateFn2);

        expect(updateFn1).toHaveBeenCalledTimes(0);
        expect(updateFn2).toHaveBeenCalledTimes(0);
        expect(obs1.left).toBe(0);
        expect(obs2.top).toBe(0);

        obs1.ref.style.marginLeft = '300px';
        obs2.ref.style.marginTop = '300px';

        requestAnimationFrame(() => {
          obs1.update();
          obs2.update();
        });

        expect(updateFn1).toHaveBeenCalledTimes(0);
        expect(updateFn2).toHaveBeenCalledTimes(0);

        setTimeout(() => {
          expect(updateFn1).toHaveBeenCalled();
          expect(updateFn2).toHaveBeenCalled();
          expect(obs1.left).toBe(300);
          expect(obs2.top).toBe(300);
          resolve();
        }, 50);
      });
    });
  });
});