import { defineInjectors } from './injector';

export interface QueryInjectorConfig<V> {
  parse?: (value: V) => any;
}

export const queryInjector = Symbol(undefined);
export const queryAllInjector = Symbol(undefined);

export function query(
  selector: string | (new (...args: any[]) => any),
  config: QueryInjectorConfig<Element> = {}
) {
  return defineInjectors(queryInjector, { selector, ...config });
}

export function queryClosest(
  selector: string | (new (...args: any[]) => any),
  config: QueryInjectorConfig<Element> = {}
) {
  return defineInjectors(queryInjector, { selector, ...config, closest: true });
}

export function queryAll(
  selector: string | (new (...args: any[]) => any),
  config: QueryInjectorConfig<NodeList> = {}
) {
  return defineInjectors(queryAllInjector, { selector, ...config });
}