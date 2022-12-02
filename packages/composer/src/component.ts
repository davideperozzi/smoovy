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
  condition?: () => boolean;
}

export interface ComponentWrapper<T = any> {
  component: T;
  ctor: new () => T;
  config: ComponentConfig;
  element: HTMLElement;
  unlisten?: Unlisten;
}

export function component(config: ComponentConfig | string) {
  return (target: any) => {
    config = typeof config === 'string' ? { selector: config } : config;

    target.__config = config;

    return target;
  };
}
