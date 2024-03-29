import { isObj } from './base';

interface DefaultObject {
  [id: string]: any;
}

export function objectDeepMerge<T extends DefaultObject>(
  target: T,
  ...sources: DefaultObject[]
): T {
  if ( ! sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObj(target) && isObj(source)) {
    for (const key in source) {
      if (isObj(source[key])) {
        if ( ! target[key]) {
          Object.assign(target, { [key]: {} });
        }

        objectDeepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return objectDeepMerge(target, ...sources);
}

export function objectDeepClone<T extends DefaultObject>(obj: T): T {
  if (isObj(obj)) {
    const copy: { [attr: string]: any } = {};

    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        copy[attr] = objectDeepClone(obj[attr]);
      }
    }

    return copy as T;
  }

  return obj;
}

export function objectValueByPath<T extends DefaultObject>(
  obj: T|undefined,
  path: string,
  separator = '.'
): any {
  const keys = path.split(separator);
  let last = obj;

  while (keys.length > 0) {
    const key = keys.shift();

    if (typeof last === 'object' && key) {
      last = last[key];
    } else {
      last = undefined;
      break;
    }
  }

  return last;
}
