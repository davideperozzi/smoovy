import { defineInjectors } from './injector';

export interface QueryInjectorConfig<V> {
  parse?: (value: V) => any
}

export const queryInjector = Symbol(undefined);
export const queryAllInjector = Symbol(undefined);

export function query(
  selector: string,
  config: QueryInjectorConfig<Element> = {}
) {
  return defineInjectors(queryInjector, { selector, ...config });
}

export function queryAll(
  selector: string,
  config: QueryInjectorConfig<NodeList> = {}
) {
  return defineInjectors(queryAllInjector, { selector, ...config });
}
