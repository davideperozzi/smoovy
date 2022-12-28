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

export async function inject<T>(
  id: symbol,
  target: any,
  parse: (name: string, config: any, target: any) => Promise<any>
): Promise<T> {
  const injections = target[id];

  for (const name in injections) {
    await parse(name, injections[name], target);
  }

  return target as T;
}

export async function injectInstances<V>(
  id: symbol,
  target: any,
  instances: V[] = []
) {
  return inject(id, target, async (name, config) => {
    const clazz = config.class;
    const async = config.async === true;
    const value = instances.find(val => val instanceof clazz);

    if ( ! clazz || ! value) {
      return;
    }

    if (async && value instanceof Promise) {
      target[name] = await value;
    } else {
      target[name] = value;
    }
  });
}