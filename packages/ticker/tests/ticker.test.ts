import { Ticker, TickerThread } from '../src';
import { JSDOM } from 'jsdom';
import { describe, it, expect, vi, beforeEach } from 'vitest';


describe('ticker', () => {
  const glob = (global as any);
  const dom = new JSDOM(``, { pretendToBeVisual: true });

  glob.window = dom.window;
  glob.document = dom.window.document;
  glob.navigator = dom.window.navigator;

  const ticker = new Ticker();

  beforeEach(() => {
    ticker.override = false;

    ticker.kill();
  });

  it('should be defined', () => {
    return expect(Ticker).toBeDefined();
  });

  it('should return a thread', () => {
    return expect(ticker.add(() => {})).toBeInstanceOf(TickerThread);
  });

  it('should start functioning thread', async () => {
    const start = Ticker.now();

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        ticker.add((delta, time, kill) => {
          expect(delta).toBeGreaterThan(0);
          expect(delta).toBeLessThan(30);
          expect(time).toBeGreaterThanOrEqual(start);
          expect(kill).toBeInstanceOf(Function);
          resolve();
        });
      }, 100);
    });
  });

  it('should spawn a destroyable thread', async () => {
    const thread = ticker.add((delta, time, kill) => {});

    expect(thread.dead).toBe(false);

    thread.kill();

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(thread.dead).toBe(true);
        resolve();
      }, 100);
    });
  });

  it('should tick normally for 300ms', async () => {
    const start = Ticker.now();

    await new Promise<void>((resolve) => {
      ticker.add((delta, time, kill) => {
        if (time - start >= 300) {
          resolve();
          kill();
        }
      });
    });
  });

  it('should be overwritable', async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        ticker.override = true;

        ticker.add(() => {});
        ticker.add(() => {});
        ticker.add(() => {});

        expect(ticker.ticking).toBe(false);
        resolve();
      }, 50);
    });
  });

  it('should tick and update manually', async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const fn = vi.fn();

        ticker.override = true;
        ticker.add(fn);
        ticker.update();
        ticker.update();
        ticker.update();
        ticker.update();

        setTimeout(() => {
          expect(fn).toBeCalledTimes(4);
          resolve();
        }, 10);
      }, 50);
    });
  });
});