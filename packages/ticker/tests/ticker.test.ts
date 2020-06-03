import { Ticker, TickerThread } from '../src';
import { JSDOM } from 'jsdom';

describe('general', () => {
  const glob = (global as any);
  const dom = new JSDOM(``, { pretendToBeVisual: true });

  glob.window = dom.window;
  glob.document = dom.window.document;
  glob.navigator = dom.window.navigator;

  const ticker = new Ticker();

  beforeEach(() => {
    ticker.override = false;

    ticker.setMaxFPS(60);
    ticker.setMinFPS(10);
    ticker.kill();
  });

  it('should be defined', () => {
    return expect(Ticker).toBeDefined();
  });

  it('should return a thread', () => {
    return expect(ticker.add(() => {})).toBeInstanceOf(TickerThread);
  });

  it('should start functioning thread', (done) => {
    const start = Ticker.now();

    setTimeout(() => {
      ticker.add((delta, time, kill) => {
        expect(delta).toBeGreaterThan(0);
        expect(delta).toBeLessThan(10);
        expect(time).toBeGreaterThanOrEqual(start);
        expect(kill).toBeInstanceOf(Function);
        done();
      });
    }, 100);
  });

  it('should spawn a destroyable thread', (done) => {
    const thread = ticker.add((delta, time, kill) => {});

    expect(thread.dead).toBe(false);

    thread.kill();

    setTimeout(() => {
      expect(thread.dead).toBe(true);
      done();
    }, 100);
  });

  it('should tick normally for 300ms', (done) => {
    const start = Ticker.now();

    ticker.add((delta, time, kill) => {
      if (time - start >= 300) {
        done();
        kill();
      }
    });
  });

  it('should be overwritable', (done) => {
    setTimeout(() => {
      ticker.override = true;

      ticker.add(() => {});
      ticker.add(() => {});
      ticker.add(() => {});

      expect(ticker.ticking).toBe(false);
      done();
    }, 50);
  });

  it('should tick and update manually', (done) => {
    setTimeout(() => {
      const fn = jest.fn();

      ticker.override = true;
      ticker.add(fn);
      ticker.tick(1);
      ticker.tick(1);
      ticker.tick(1);
      ticker.update();

      setTimeout(() => {
        expect(fn).toBeCalledTimes(4);
        done();
      }, 10);
    }, 50);
  });

  it('should set min and max fps', () => {
    ticker.setMinFPS(10);
    ticker.setMaxFPS(30);

    expect(Math.round(ticker.minFPS)).toBe(10);
    expect(Math.round(ticker.maxFPS)).toBe(30);
  });

  it('should set min and max fps per constructor', () => {
    const ticker2 = new Ticker([10, 30]);

    expect(Math.round(ticker2.minFPS)).toBe(10);
    expect(Math.round(ticker2.maxFPS)).toBe(30);
  });

  it('should only set max fps per constructor', () => {
    const ticker2 = new Ticker(120);

    expect(Math.round(ticker2.maxFPS)).toBe(120);
  });

  it('should set to default fps if 0', () => {
    ticker.setMaxFPS(0);

    expect(Math.round(ticker.maxFPS)).toBe(ticker.intervalMs * 1000);
  });
});
