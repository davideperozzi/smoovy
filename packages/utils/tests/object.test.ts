import {
  objectDeepClone,
  objectDeepMerge,
  objectValueByPath,
} from '../src';

describe('merge', () => {
  it('should merge two objects', () => {
    const obj1 = { test: 'test1' };
    const obj2 = { test2: 'test2' };
    const result = { test: 'test1', test2: 'test2' };

    expect(objectDeepMerge(obj1, obj2)).toMatchObject(result);
  });

  it('should deep merge two objects', () => {
    const obj1 = { test: 'test1', test2: {  } };
    const obj2 = { test2: { test: 'OK' } };
    const result = { test: 'test1', test2: { test: 'OK' } };

    expect(objectDeepMerge(obj1, obj2)).toMatchObject(result);
  });

  it('should deep merge (with override) two objects', () => {
    const obj1 = { test: 'test1', test2: { test: 'NOT OK', test2: '1' } };
    const obj2 = { test2: { test: 'OK', test2: {} } };
    const result = { test: 'test1', test2: { test: 'OK', test2: {} } };

    expect(objectDeepMerge(obj1, obj2)).toMatchObject(result);
  });

  it('should deep merge (depth: 5) two objects', () => {
    const obj1 = { t: { t: { t: { t: { t: 'NOT OK' } }, t2: 'OK' } } };
    const obj2 = { t: { t: { t: { t: { t: 'OK' } } } } };
    const result = { t: { t: { t: { t: { t: 'OK' } }, t2: 'OK' } } };

    expect(objectDeepMerge(obj1, obj2)).toMatchObject(result);
  });

  it('should deep merge (with null) two objects', () => {
    const obj1 = { test: 'test1', test2: null };
    const obj2 = { test2: { test: 'OK', test2: {} } };
    const result = { test: 'test1', test2: { test: 'OK', test2: {} } };

    expect(objectDeepMerge(obj1, obj2)).toMatchObject(result);
  });
});

describe('clone', () => {
  it('should clone object an object', () => {
    const obj1 = { test: '1' };

    expect(objectDeepClone(obj1) !== obj1).toBeTruthy();
  });

  it('should deep clone object', () => {
    const objNested = { nested: true };
    const obj1 = { test: '1', test2: objNested };

    expect(objectDeepClone(obj1).test2 !== objNested).toBeTruthy();
  });
});

describe('valueByPath', () => {
  it('should get value from object by path', () => {
    const object = { d1: { d1x2: { test: 'Hi!' } }, d2: 'test' };

    expect(objectValueByPath(object, 'd1.d1x2.test')).toBe('Hi!');
    expect(objectValueByPath(object, 'd2')).toBe('test');
    expect(objectValueByPath(object, 'notset')).toBe(undefined);
  });

  it('should get value from object by path with custom separator', () => {
    const object = { d1: { d1x2: { test: 'Hi!' } } };

    expect(objectValueByPath(object, 'd1|d1x2|test', '|')).toBe('Hi!');
  });

  it('should return undefined if depth is invalid', () => {
    const object = { d1: {  } };

    expect(objectValueByPath(object, 'd1|d1x2|test', '|')).toBe(undefined);
  });
});
