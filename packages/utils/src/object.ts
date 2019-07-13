interface DefaultObject {
  [id: string]: any;
}

export function isObject(item: any): boolean {
  return (item && typeof item === 'object' &&
         ! Array.isArray(item)) &&
         ! (item instanceof Node);
}

export function objectDeepMerge<T extends DefaultObject>(
  target: T,
  ...sources: DefaultObject[]
): T {
  if ( ! sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
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
  if (isObject(obj)) {
    const copy: { [attr: string]: any } = {};

    for (const attr in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(attr)) {
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
  separator: string = '.'
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
