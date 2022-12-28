import { defineInjectors } from './injector';

export interface ConfigInjectorConfig {
  type?: StringConstructor | NumberConstructor;
  parse?: (value: any) => any
}

export const configInjector = Symbol(undefined);

export function config(key: string, config: ConfigInjectorConfig = {}) {
  return defineInjectors(configInjector, { key, ...config });
}
