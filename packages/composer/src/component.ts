import { Unlisten } from '@smoovy/listener';

export interface OnDestroy {
  onDestroy(): void | Promise<void>;
}

export interface OnCreate {
  onCreate(): void | Promise<void>;
}

export interface OnListen {
  onListen(): Unlisten | Promise<Unlisten>;
}

export interface ComponentConfig {
  selector: string;
  dataset?: string;
  condition?: () => boolean;
}

export interface ComponentWrapper<T = any> {
  component: T;
  ctor: new () => T;
  config: ComponentConfig;
  element: HTMLElement;
  unlisten?: Unlisten;
}

export const componentConfigKey = Symbol(undefined);

export function component(config: ComponentConfig | string) {
  return (target: any) => {
    config = typeof config === 'string' ? {
      selector: `[data-${config}]`,
      dataset: config.replace(/-./g, x=>x[1].toUpperCase())
    } : config;

    target[componentConfigKey] = config;

    return target;
  };
}
