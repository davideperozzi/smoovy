import { JSDOM } from 'jsdom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Ticker } from '../src';

describe('ticker', () => {
  const glob = (global as any);
  const dom = new JSDOM(``, { pretendToBeVisual: true });

  glob.window = dom.window;
  glob.document = dom.window.document;
  glob.navigator = dom.window.navigator;

  const ticker = Ticker.main;

  beforeEach(() => {
    ticker.override = false;
  });

  it('should be defined', () => expect(Ticker).toBeDefined());
  it('should add to raf', async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        ticker.add((delta, time, kill) => {
          expect(delta).toBeGreaterThan(0);
          expect(delta).toBeLessThan(30);
          expect(time).toBeGreaterThanOrEqual(0);
          kill();
          resolve();
        });
      }, 100);
    });
  });

  it('should spawn a destroyable task', async () => {
    const task = ticker.add((delta, time) => {});

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        task.kill();
        expect(ticker.ticking).toBe(true);
        resolve();
      }, 100);
    });
  });

  it('should tick normally for 300ms', async () => {
    await new Promise<void>((resolve) => {
      ticker.add((delta, time, kill) => {
        if (time >= 300) {
          resolve();
          kill();
        }
      });
    });
  });

  it('should be overwritable', async () => {
    const newTicker = new Ticker(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => {

        newTicker.add(() => {});
        newTicker.add(() => {});
        newTicker.add(() => {});

        expect(newTicker.ticking).toBe(false);
        resolve();
      }, 50);
    });
  });

  it('should tick and update manually', async () => {
    const newTicker = new Ticker(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const fn = vi.fn();

        newTicker.add(fn);
        newTicker.tick(0);
        newTicker.tick(performance.now());
        newTicker.tick(performance.now() + 1);
        newTicker.tick(performance.now() + 2);
        newTicker.tick(performance.now() + 3);

        setTimeout(() => {
          expect(fn).toBeCalledTimes(5);
          resolve();
        }, 10);
      }, 50);
    });
  });
});