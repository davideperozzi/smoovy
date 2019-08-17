import { Tween } from '../src';

describe('general', () => {
  it('should mutate and tween object property from 0 to 100 in 300ms',
    (done) => {
      const mutation = { x: 0 };

      Tween.fromTo(mutation, { x: 100 }, { duration: 300 });

      setTimeout(() => {
        expect(mutation.x).toBe(100);
        done();
      }, 500);
    }
  );

  it('should not mutate but tween the property from 0 to 100 in 300ms',
    (done) => {
      const mutation = { x: 0 };

      Tween.fromTo(mutation, { x: 100 }, { duration: 300, mutate: false });

      setTimeout(() => {
        expect(mutation.x).toBe(0);
        done();
      }, 500);
    }
  );

  it('should stop the tween after 100ms', (done) => {
    const data = { x: 0 };
    const tween = Tween.fromTo(data, { x: 100 }, { duration: 300 });

    setTimeout(() => {
      tween.stop();
    }, 100);

    setTimeout(() => {
      expect(data.x).toBeLessThan(100);
      done();
    }, 500);
  });

  it('should tween from 0 to 0 without change and options', (done) => {
    const data = { x: 0 };
    const tween = Tween.fromTo(data, { x: 0 });

    setTimeout(() => {
      expect(data.x).toBe(0);
      done();
    }, 10);
  });

  it('should not tween invalid from/to options', (done) => {
    const data = { y: 0 };

    Tween.fromTo(data, { x: 0 } as any, { duration: 20 });

    setTimeout(() => {
      expect(data.y).toBe(0);
      done();
    }, 50);
  });

  it('should not overwrite running tween', (done) => {
    const data = { y: 0 };

    Tween.fromTo(data, { y: 50 }, { duration: 20, overwrite: false });
    Tween.fromTo(data, { y: 50 }, { duration: 50, overwrite: false });

    setTimeout(() => {
      expect(data.y).toBeLessThan(50);
    }, 20);

    setTimeout(() => {
      expect(data.y).toEqual(50);
      done();
    }, 100);
  });

  it('should call the update method', (done) => {
    const data = { y: 0 };
    const update = jest.fn();

    Tween.fromTo(data, { y: 50 }, { duration: 100, on: { update } });

    setTimeout(() => {
      expect(update).toHaveBeenCalled();
      done();
    }, 120);
  });

  it('should not throw an error if stopped multiple times', (done) => {
    const tween = Tween.fromTo({ y: 0 }, { y: 50 }, { duration: 100 });

    setTimeout(() => {
      tween.stop();
      tween.stop();
      tween.stop();
      done();
    }, 50);
  });

  it('should call the stop method', (done) => {
    const stop = jest.fn();
    const tween = Tween.fromTo(
      { y: 0 },
      { y: 50 },
      {
        duration: 100,
        on: { stop }
      }
    );

    setTimeout(() => {
      tween.stop();
      tween.stop();

      expect(stop).toBeCalledTimes(1);

      done();
    }, 50);
  });

  it('should enter the complete callback', (done) => {
    const data = { x: 0 };

    Tween.fromTo(
      data,
      { x: 100 },
      {
        duration: 300,
        on: {
          complete: () => {
            expect(data.x).toBe(100);
            done();
          }
        }
      }
    );
  });

  it('should overwrite the tween', (done) => {
    const data = { x: 0 };
    const overwriteFn = jest.fn();

    Tween.fromTo(
      data,
      { x: 100 },
      {
        duration: 300,
        on: {
          overwrite: overwriteFn,
          complete: () => {
            done.fail();
          }
        }
      }
    );

    setTimeout(() => {
      Tween.fromTo(
        data,
        { x: 100 },
        {
          duration: 200,
          on: {
            overwrite: overwriteFn,
            complete: () => {
              expect(overwriteFn).toBeCalledTimes(1);
              expect(data.x).toBe(100);
              done();
            }
          }
        }
      );
    }, 100);
  });

  it('should pause and resume the tween', (done) => {
    const pauseFn = jest.fn();
    const startFn = jest.fn();
    const completeFn = jest.fn();
    const dataFrom = { x: 0 };
    const dataTo = { x: 200 };
    const tween = Tween.fromTo(
      dataFrom,
      dataTo,
      {
        duration: 100,
        on: {
          pause: pauseFn,
          start: startFn,
          complete: completeFn,
        }
      }
    );


    setTimeout(() => {
      tween.pause();

      setTimeout(() => {
        expect(tween.progress).toBeLessThan(1);

        tween.start();

        expect(pauseFn).toBeCalledTimes(1);
        expect(startFn).toBeCalledTimes(2);

        setTimeout(() => {
          expect(tween.progress).toBeGreaterThanOrEqual(1);
          expect(completeFn).toBeCalledTimes(1);
          done();
        }, 100);
      }, 50);
    }, 50);
  });

  it('should start after the delay', (done) => {
    const delayFn = jest.fn();

    Tween.fromTo(
      { x: 0 },
      { x: 100 },
      {
        delay: 100,
        on: {
          delay: delayFn,
          complete: () => {
            expect(delayFn).toHaveBeenCalled();
            done();
          }
        }
      }
    );
  });

  it('should not start if paused', (done) => {
    const tween = Tween.fromTo(
      { x: 0 },
      { x: 100 },
      {
        paused: true,
        duration: 50
      }
    );

    expect(tween.progress).toBe(0);
    expect(tween.paused).toBe(true);
    expect(tween.complete).toBe(false);

    setTimeout(() => {
      expect(tween.progress).toBe(0);
      expect(tween.paused).toBe(true);
      expect(tween.complete).toBe(false);
      done();
    }, 60);
  });

  it('should overwrite an active delay and call reset', (done) => {
    let delayMs = 0;
    const resetFn = jest.fn();
    const tween = Tween.fromTo(
      { x: 0 },
      { x: 100 },
      {
        delay: 200,
        duration: 200,
        on: {
          reset: resetFn,
          delay: (passed) => delayMs = passed
        }
      }
    );

    setTimeout(() => {
      expect(delayMs).toBeGreaterThan(90);
      expect(delayMs).toBeLessThan(200);
      expect(tween.progress).toBe(0);

      tween.reset();

      setTimeout(() => {
        expect(delayMs).toBeGreaterThan(90);
        expect(delayMs).toBeLessThan(200);
        expect(tween.progress).toBe(0);
        expect(resetFn).toBeCalledTimes(1);

        tween.stop();
        done();
      }, 150);
    }, 150);
  });

  it('should not run delay if paused', (done) => {
    Tween.fromTo(
      { x: 0 },
      { x: 100 },
      {
        paused: true,
        delay: 100,
        duration: 100,
        on: {
          start: () => done.fail(),
          delay: () => done.fail()
        }
      }
    );

    setTimeout(() => done(), 200);
  });

  it('should not run callbacks if already active on start & pause', (done) => {
    const startFn = jest.fn();
    const pauseFn = jest.fn();
    const tween = Tween.fromTo(
      { x: 0 },
      { x: 100 },
      {
        delay: 100,
        paused: true,
        duration: 100,
        on: {
          start: startFn,
          pause: pauseFn
        }
      }
    );

    setTimeout(() => {
      tween.start();
      tween.start();
      tween.start();
      tween.start();

      setTimeout(() => {
        tween.pause();
        tween.pause();
        tween.pause();
        tween.pause();

        expect(startFn).toBeCalledTimes(1);
        expect(pauseFn).toBeCalledTimes(1);
        done();
      }, 10);
    }, 10);
  });

  it('should reset without mutation', (done) => {
    const target = { x: 0 };
    const tween = Tween.fromTo(
      target,
      { x: 100 },
      {
        mutate: false,
        duration: 100,
        on: {
          complete: () => {
            expect(target).toMatchObject({ x: 0 });
            done();
          }
        }
      }
    );

    setTimeout(() => {
      tween.reset();
    }, 50);
  });

  it('should set the correct progress', (done) => {
    const tween = Tween.fromTo(
      { x: 0 },
      { x: 100 },
      {
        duration: 100,
        paused: true
      }
    );

    expect(tween.passed).toBe(0);

    setTimeout(() => {
      tween.progress = 0.5;
      expect(tween.passed).toBe(50);
      done();
    }, 50);
  });
});
