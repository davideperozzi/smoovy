import { clamp, mapRange } from '../src';

describe('clamp', () => {
  it('should clamp number > 10', () => {
    return expect(clamp(500, 0, 10)).toBe(10);
  });

  it('should clamp number < 10', () => {
    return expect(clamp(5, 10, 20)).toBe(10);
  });
});

describe('mapRange', () => {
  it('should map "50" from range [0, 100] into [0, 1]', () => {
    return expect(mapRange(50, 0, 100, 0, 1)).toBe(0.5);
  });

  it('should map "0" from range [-100, 100] into [-1, 1]', () => {
    return expect(mapRange(0, -100, 100, -1, 1)).toBe(0);
  });

  it('should map "-50" from range [-60, 0] into [0, 0.5]', () => {
    return expect(mapRange(-30, -60, 0, 0, 0.5)).toBe(0.25);
  });
});
