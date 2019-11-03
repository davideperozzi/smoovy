import { isArr, isDef, isFunc, isNum, isObj, isStr } from '../src';

describe('general', () => {
  it('should assume def correctly', () => {
    expect(isDef('1')).toBeTruthy();
    expect(isDef(undefined)).toBeFalsy();
    expect(isDef('')).toBeTruthy();
    expect(isDef(null)).toBeTruthy();
  });

  it('should assume num correctly', () => {
    expect(isNum(1)).toBeTruthy();
    expect(isNum(NaN)).toBeTruthy();
    expect(isNum(Infinity)).toBeTruthy();
    expect(isNum(-1)).toBeTruthy();
    expect(isNum(undefined)).toBeFalsy();
  });

  it('should assume string correctly', () => {
    expect(isStr(1)).toBeFalsy();
    expect(isStr('')).toBeTruthy();
    expect(isStr('test')).toBeTruthy();
    expect(isStr(undefined)).toBeFalsy();
  });

  it('should assume array correctly', () => {
    expect(isArr([])).toBeTruthy();
    expect(isArr({})).toBeFalsy();
    expect(isArr(undefined)).toBeFalsy();
  });

  it('should assume objects correctly', () => {
    // Nope
    expect(isObj([])).toBeFalsy();
    expect(isObj('')).toBeFalsy();
    expect(isObj(undefined)).toBeFalsy();
    expect(isObj(1337)).toBeFalsy();
    expect(isObj(null)).toBeFalsy();

    // Yeahh
    expect(isObj({})).toBeTruthy();
    expect(isObj({ test: 'test', 1: '12' })).toBeTruthy();
    expect(isObj(new Object)).toBeTruthy();
    expect(isObj(new class T {})).toBeTruthy();
  });

  it('should assume function correctly', () => {
    expect(isFunc([])).toBeFalsy();
    expect(isFunc({})).toBeFalsy();
    expect(isFunc(undefined)).toBeFalsy();
    expect(isFunc(() => {})).toBeTruthy();
  });
});
