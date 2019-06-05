import { Ticker, TickerThread } from '../';

describe('general', () => {
  (global as any).window = global;

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
    });
  });

  it('should spawn a destroyable thread', (done) => {
    const thread = ticker.add((delta, time, kill) => kill());

    expect(thread.dead).toBe(false);

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

  it('should set min and max fps', () => {
    ticker.setMaxFPS(30);
    ticker.setMinFPS(10);

    expect(Math.round(ticker.maxFPS)).toBe(30);
    expect(Math.round(ticker.minFPS)).toBe(10);
  });
});
