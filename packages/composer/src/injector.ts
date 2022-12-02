export function defineInjectors(id: symbol, data?: any) {
  return (target: any, propertyKey: string) => {
    const key = Symbol(propertyKey);

    target[id] = target[id] || {};
    target[id][propertyKey] = data;

    Object.defineProperty(target, propertyKey, {
      set(value) { this[key] = value; },
      get() { return this[key]; }
    });

    return target;
  };
}

export async function inject<T, V>(
  id: symbol,
  instance: any,
  values: V[] = []
): Promise<T> {
  const injections = instance[id];

  for (const name in injections) {
    const config = injections[name];
    const clazz = config.class;
    const async = config.async === true;
    const value = values.find(val => val instanceof clazz);

    if ( ! clazz || ! value) {
      continue;
    }

    if (async) {
      instance[name] = await value;
    } else {
      instance[name] = value;
    }
  }

  return instance as T;
}