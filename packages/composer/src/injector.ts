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
): Promise<void> {
  const injections = target[id];

  for (const name in injections) {
    await parse(name, injections[name], target);
  }
}

export function injectInstances<V>(
  id: symbol,
  target: any,
  instances: V[] = [],
  preventAsync = false,
  fallback?: V
) {
  return inject(id, target, async (name, config) => {
    const clazz = config.class;
    const async = config.async === true;
    const value = instances.find(val => val instanceof clazz) || fallback;

    if ( ! clazz || ! value) {
      return;
    }

    if (async && value instanceof Promise) {
      if (preventAsync) {
        throw new Error(
          `await prevented! You can't wait for the injectables here, ` +
          `since there may be unresolved dependencies which would cause a block`
        );
      }

      target[name] = await value;
    } else {
      target[name] = value;
    }
  });
}