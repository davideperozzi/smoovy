import { Range } from '../src';

describe('general', () => {
  it('should set start and end properly', () => {
    const range1 = new Range(100, -100);
    const range2 = new Range(0, 1);

    expect(range1.start).toBe(-100);
    expect(range1.end).toBe(100);
    expect(range2.start).toBe(0);
    expect(range2.end).toBe(1);
  });

  it('should map values', () => {
    const range = new Range(-100, 100);

    expect(range.mapTo(0, 0, 1)).toBe(0.5);
  });

  it('should have default mapTo values 0,1', () => {
    const range = new Range(-100, 100);

    expect(range.mapTo(0)).toBe(0.5);
  });
});
