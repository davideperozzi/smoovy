import { Uid } from '../src';

describe('general', () => {
  beforeEach(() => Uid.reset());

  it('should generate id from 0', () => {
    return expect(Uid.get()).toBe('0');
  });

  it('should generate an id with a prefix', () => {
    return expect(Uid.get('__')).toBe('__0');
  });

  it('should generate 500 ids starting with 0', (done) => {
    for (let i = 0; i < 500; i++) {
      Uid.get();
    }

    expect(Uid.get()).toBe((500).toString(36));
    done();
  });

  it('should generate 10000 ids starting with 0', (done) => {
    for (let i = 0; i < 10000; i++) {
      Uid.get();
    }

    expect(Uid.get()).toBe((10000).toString(36));
    done();
  });
});
