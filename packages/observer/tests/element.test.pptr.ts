import { ElementObserver as _ElementObserver, ElementState } from '../src';

declare global {
  interface Window {
    testEl1: HTMLElement;
    testState1: ElementState;
    ElementObserver: typeof _ElementObserver;
  }
}

describe('browser', () => {
  const vpSize = { width: 1920, height: 1080 };
  const getState1 = async () => {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        window.testState1.update();

        setTimeout(() => {
          resolve(window.testState1);
        }, 50);
      });
    }) as Promise<ElementState>;
  };

  let stateChangedCounter = 0;
  const state1Changed = async (changed: (state: ElementState) => void) => {
    const fncName = `test_1_changed_${stateChangedCounter}`;

    await page.exposeFunction(fncName, (state) => changed(state));
    await page.evaluate((name) => {
      window.testState1.changed(() => {
        (window as any)[name](window.testState1);
      });
    }, fncName);

    stateChangedCounter++;

    return changed;
  };

  beforeAll(async () => {
    await page.goto(`${process.env.TEST_URL}/element.test.html`);
  });

  beforeEach(async () => {
    await page.reload();
    await page.setViewport(vpSize);
    await page.evaluate(() => {
      const element = document.querySelector('#test1') as HTMLElement;
      const state = window.ElementObserver.observe(element);

      element.removeAttribute('style');

      element.style.width = '50vw';
      element.style.height = '50vh';
      element.style.marginLeft = '10vw';
      element.style.marginTop = '10vh';
      element.style.backgroundColor = 'green';
      element.textContent = 'Test element #1';

      state.update(true);

      window.testEl1 = element;
      window.testState1 = state;
    });
  });

  it('should has element #test1', async () => {
    const element = await page.evaluate(() => window.testEl1);

    expect(element).toBeTruthy();
  });

  it('should find ElementObserver in window', async() => {
    expect(await page.evaluate(() => 'ElementObserver' in window)).toBe(true);
  });

  it('should get the existing element state with the same element',
    async () => {
      const stateMatches = await page.evaluate(() => {
        const newState = window.ElementObserver.observe(
          window.testState1.element
        );

        return newState === window.testState1;
      });

      expect(stateMatches).toStrictEqual(true);
    }
  );

  it('should change the element state size', async () => {
    let state = await getState1();

    expect(state.size).toMatchObject({
      width: vpSize.width * .5,
      height: vpSize.height * .5
    });

    await page.setViewport({
      width: vpSize.width * .5,
      height: vpSize.height * .5
    });

    await page.evaluate(() => window.testState1.update(true));

    await new Promise((resolve) => {
      setTimeout(async () => {
        state = await getState1();

        expect(state.size).toMatchObject({
          width: vpSize.width * .5 * .5,
          height: vpSize.height * .5 * .5
        });

        resolve();
      }, 250);
    });
  });

  it('should call the changed-callback for the element', async (done) => {
    const changed = await state1Changed(
      jest.fn((state) => {
        expect(state.size).toMatchObject({
          width: vpSize.width * .5 * .7,
          height: vpSize.height * .5 * .7
        });
      })
    );

    await page.setViewport({
      width: vpSize.width * .7,
      height: vpSize.height * .7
    });

    await page.evaluate(() => window.testState1.update(true));

    setTimeout(() => {
      expect(changed).toBeCalled();
      done();
    }, 150);
  });

  it('should has the correct offset in the state', async () => {
    const state = await getState1();

    expect(state.offset).toMatchObject({
      x: vpSize.width * .1,
      y: vpSize.height * .1,
    });
  });

  it('should remove the state from the observer', async () => {
    const stateChanged = await page.evaluate(() => {
      const prevState = window.testState1;

      window.testState1.destroy();

      return prevState !== window.ElementObserver.observe(window.testEl1);
    });

    expect(stateChanged).toStrictEqual(true);
  });

  it('should not call update if nothing\'s changed', async () => {
    const changed = await state1Changed(jest.fn());

    await page.evaluate(() => window.testState1.update());

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toBeCalledTimes(0);
        resolve();
      }, 150);
    });

    await page.evaluate(() => {
      window.testState1.element.style.width = '10vw';
      window.testState1.update();
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toBeCalledTimes(1);
        resolve();
      }, 150);
    });
  });

  it('should update on dom mutations', async () => {
    const changed = await state1Changed(jest.fn());

    await page.evaluate(() => {
      const test2 = document.createElement('div');

      test2.style.width = '50vw';
      test2.style.height = '50vh';
      test2.style.backgroundColor = 'orange';
      test2.textContent = 'Test element #2';

      document.body.prepend(test2);
      document.body.removeChild(test2);

      setTimeout(() => {
        document.body.prepend(test2);
      });
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toBeCalledTimes(1);
        resolve();
      }, 150);
    });
  });
});
