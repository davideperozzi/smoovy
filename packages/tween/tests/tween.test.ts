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

  it('shouldn\'t mutate but tween the property from 0 to 100 in 300ms',
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

    Tween.fromTo(data, { y: 50 }, { duration: 100, update });

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
    const tween = Tween.fromTo({ y: 0 }, { y: 50 }, { duration: 100, stop });

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
        complete: () => {
          expect(data.x).toBe(100);
          done();
        }
      }
    );
  });

  it('should should overwrite the tween', (done) => {
    const data = { x: 0 };

    Tween.fromTo(
      data,
      { x: 100 },
      {
        duration: 300,
        complete: () => {
          done.fail();
        }
      }
    );

    setTimeout(() => {
      Tween.fromTo(
        data,
        { x: 100 },
        {
          duration: 200,
          complete: () => {
            expect(data.x).toBe(100);
            done();
          }
        }
      );
    }, 100);
  });
});
