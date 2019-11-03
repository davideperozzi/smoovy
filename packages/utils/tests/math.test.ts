import { clamp, mapRange, lerp, roundDec, cutDec, between } from '../src';

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

describe('between', () => {
  it('should be between 0.5 and 1', () => {
    return expect(between(0.6, 0.5, 1)).toBeTruthy();
  });

  it('should be between 30 and 50', () => {
    return expect(between(30, 30, 50)).toBeFalsy();
  });
});

describe('lerp', () => {
  it('should lerp 100 to 50 with 0.5', () => {
    return expect(lerp(100, 50, 0.5)).toBe(75);
  });

  it('should lerp 75 to 50 with 0.1', () => {
    return expect(lerp(75, 50, 0.1)).toBe(75 * 0.9 + 50 * 0.1);
  });
});

describe('roundDec', () => {
  it('round 0.505 to 0.51', () => {
    return expect(roundDec(0.505, 2)).toBe(0.51);
  });

  it('round 0.334 to 0.34', () => {
    return expect(roundDec(0.334, 2)).toBe(0.33);
  });
});

describe('cutDec', () => {
  it('cut 0.56 to 0.6', () => {
    return expect(cutDec(0.56, 1)).toBe(0.6);
  });

  it('round 0.334 to 0.33', () => {
    return expect(cutDec(0.334, 2)).toBe(0.33);
  });
});
