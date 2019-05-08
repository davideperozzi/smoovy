import { demo } from '../../../../demos/demo';
import { Ticker } from '../../src/index';

demo('clock', ({ clockEl }) => ({
  init: () => ({
    ticker: new Ticker(),
    initTime: Date.now()
  }),
  play: ({ ticker, initTime }) => {
    const now = Date.now() - initTime;

    return {
      ticker,
      thread: ticker.add((delta, time, kill) => {
        const passedMs = Math.floor(time - now);

        (clockEl as HTMLElement).textContent = `
          ${ticker.minFPS}/${ticker.maxFPS}FPS
          | ${Math.floor(passedMs / 1000)}s (${passedMs}ms)
          | ▲ ${delta}ms
        `;
      })
    };
  },
  reset: async ({ thread, ticker }) => {
    ticker.kill();

    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 100);
    });
  }
}));
