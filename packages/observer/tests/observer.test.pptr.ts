import {
  Observable, observe as _observe, unobserve as _unobserve,
} from '../src';

declare global {
  interface Window {
    testEl1: HTMLElement;
    testObs1: Observable;
    observe: typeof _observe;
    unobserve: typeof _unobserve;
  }
}

describe('browser', () => {
  const vpSize = { width: 1920, height: 1080 };
  const getState1 = async () => {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        window.testObs1.update();

        setTimeout(() => {
          resolve(window.testObs1);
        }, 50);
      });
    }) as Promise<Observable>;
  };

  let stateChangedCounter = 0;
  const state1Changed = async (changed: (state: Observable) => void) => {
    const fncName = `test_1_changed_${stateChangedCounter}`;

    await page.exposeFunction(fncName, (state) => changed(state));
    await page.evaluate((name) => {
      window.testObs1.onUpdate(() => {
        (window as any)[name](window.testObs1);
      });
    }, fncName);

    stateChangedCounter++;

    return changed;
  };

  beforeEach(async () => {
    await page.goto(`${process.env.TEST_URL}/observer.test.html`);
    await page.setViewport(vpSize);
    await page.evaluate(() => {
      const element = document.querySelector('#test1') as HTMLElement;
      const observable = window.observe(element);

      element.removeAttribute('style');

      element.style.width = '50vw';
      element.style.height = '50vh';
      element.style.marginLeft = '10vw';
      element.style.marginTop = '10vh';
      element.style.backgroundColor = 'green';
      element.textContent = 'Test element #1';

      observable.update();

      window.testEl1 = element;
      window.testObs1 = observable;
    });
  });

  it('should contain element #test1', async () => {
    const element = await page.evaluate(() => window.testEl1);

    expect(element).toBeTruthy();
  });

  it('should find (un)observe in window', async() => {
    expect(await page.evaluate(() => 'observe' in window)).toBe(true);
    expect(await page.evaluate(() => 'unobserve' in window)).toBe(true);
  });

  it('should change the element state size', async () => {
    let state = await getState1();

    expect(state.offset).toMatchObject({
      width: vpSize.width * .5,
      height: vpSize.height * .5
    });

    await page.setViewport({
      width: vpSize.width * .5,
      height: vpSize.height * .5
    });

    await page.evaluate(() => window.testObs1.update());

    await new Promise((resolve) => {
      setTimeout(async () => {
        state = await getState1();

        expect(state.offset).toMatchObject({
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
        expect(state.offset).toMatchObject({
          width: vpSize.width * .5 * .7,
          height: vpSize.height * .5 * .7
        });
      })
    );

    await page.setViewport({
      width: vpSize.width * .7,
      height: vpSize.height * .7
    });

    await page.evaluate(() => window.testObs1.update());

    setTimeout(() => {
      expect(changed).toHaveBeenCalled();
      done();
    }, 500);
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
      const prevState = window.testObs1;

      window.unobserve(window.testObs1);

      return prevState !== window.observe(window.testEl1);
    });

    expect(stateChanged).toStrictEqual(true);
  });

  it('should update on dom mutations', async () => {
    const changed = await state1Changed(jest.fn());

    await page.evaluate(async () => {
      const test2 = document.createElement('div');

      test2.style.width = '50vw';
      test2.style.height = '50vh';
      test2.textContent = 'Test element #2';

      setTimeout(() => document.body.prepend(test2), 80);
      setTimeout(() => document.body.removeChild(test2), 160);
      setTimeout(() => document.body.prepend(test2), 320);
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(changed).toHaveBeenCalled();
        resolve();
      }, 420);
    });
  });
});
