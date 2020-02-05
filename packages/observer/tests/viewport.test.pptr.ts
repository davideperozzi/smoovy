import { ViewportObserver as _ViewportObserver, ViewportState } from '../src';

declare global {
  interface Window {
    ViewportObserver: typeof _ViewportObserver;
  }
}

describe('browser', () => {
  const defaultViewportSize = { width: 1920, height: 1080 };

  let viewportChangedCounter = 0;
  const viewportChanged = async (changed: (state: ViewportState) => void) => {
    const fncName = `viewport_changed_${viewportChangedCounter}`;

    await page.exposeFunction(fncName, changed);
    await page.evaluate((name) => {
      window.ViewportObserver.changed((state) => {
        (window as any)[name](state);
      });
    }, fncName);

    viewportChangedCounter++;

    return changed;
  };


  beforeAll(async () => {
    await page.goto(`${process.env.TEST_URL}/viewport.test.html`);
  });

  beforeEach(async () => {
    await page.reload();
    await page.setViewport(defaultViewportSize);
    await page.evaluate(() => window.ViewportObserver.update());
  });

  it('should has the default viewport size', async () => {
    const matched = await page.evaluate((size) => {
      return new Promise((resolve, reject) => {
        window.ViewportObserver.state.then((state) => {
          resolve(state.width === size.width && state.height === size.height);
        });
      });

    }, defaultViewportSize);

    expect(matched).toStrictEqual(true);
  });

  it('should call the changed method', async () => {
    const changed = await viewportChanged(jest.fn(() => {}));

    expect(changed).toHaveBeenCalledTimes(0);

    await page.setViewport({ width: 1337, height: 1337 });

    await new Promise((resolve) => {
      setTimeout(async () => {
        await page.evaluate(() => window.ViewportObserver.update());
        resolve();
      }, 200);
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toHaveBeenCalledTimes(1);
        resolve();
      }, 500);
    });
  });

  it('should not trigger if nothing has changed', async () => {
    const changed = await viewportChanged(jest.fn(() => {}));

    expect(changed).toHaveBeenCalledTimes(0);

    await new Promise((resolve) => {
      setTimeout(async () => {
        await page.evaluate(() => window.ViewportObserver.update());
        resolve();
      }, 50);
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toHaveBeenCalledTimes(0);
        resolve();
      }, 500);
    });
  });

  it('should trigger if update is forced and nothing has changed', async () => {
    const changed = await viewportChanged(jest.fn(() => {}));

    expect(changed).toHaveBeenCalledTimes(0);

    await new Promise((resolve) => {
      setTimeout(async () => {
        await page.evaluate(() => window.ViewportObserver.update(true));
        resolve();
      }, 50);
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toHaveBeenCalledTimes(1);
        resolve();
      }, 500);
    });
  });

  it(
    `should not trigger because of a
    silent update, event if the size has chnaged`,
    async () => {
      const changed = await viewportChanged(jest.fn(() => {}));

      expect(changed).toHaveBeenCalledTimes(0);

      await page.setViewport({ width: 1337, height: 1337 });

      await new Promise((resolve) => {
        setTimeout(async () => {
          await page.evaluate(() => {
            window.ViewportObserver.update(true, true);
          });
          resolve();
        }, 50);
      });

      await new Promise((resolve) => {
        setTimeout(() => {
          expect(changed).toHaveBeenCalledTimes(1);
          resolve();
        }, 500);
      });
    });
});
