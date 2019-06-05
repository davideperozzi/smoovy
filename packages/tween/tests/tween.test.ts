import { Tween } from '../';

describe('general', () => {
  (global as any).window = global;

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
      )
    }, 100);
  });
});
