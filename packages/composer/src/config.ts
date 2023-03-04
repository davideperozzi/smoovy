import { defineInjectors } from './injector';

export type ConfigInjectorType = (
  StringConstructor |
  NumberConstructor |
  BooleanConstructor |
  ArrayConstructor |
  ObjectConstructor
);

export interface ConfigInjectorConfig {
  type?: ConfigInjectorType;
  parse?: (value: any) => any
}

export const configInjector = Symbol(undefined);

export function config(key: string, config: ConfigInjectorConfig = {}) {
  return defineInjectors(configInjector, { key, ...config });
}
