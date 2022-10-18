import { Unlisten } from '@smoovy/event';

export interface Component extends OnDestroy, OnListen {}

export interface OnDestroy {
  onDestroy(): void;
}

export interface OnListen {
  onListen(): Unlisten;
}

export interface ComponentConfig {
  selector: string;
  condition?: () => boolean;
}

export interface ComponentWrapper<T = any> {
  element: HTMLElement;
  component: T;
  unlisten?: Unlisten;
}

export function component(config: ComponentConfig | string) {
  return (target: any) => {
    ComponentManager.register(
      target,
      typeof config === 'string'
        ? { selector: config }
        : config
    );

    return target;
  };
}

export class ComponentManager {
  private static root = document.body;
  private static registry = new Map<any, ComponentConfig>();
  private static components: ComponentWrapper[] = [];

  public static register(cls: any, config: ComponentConfig) {
    this.registry.set(cls, config);
  }

  public static update(
    scope: HTMLElement = this.root,
    purge = true,
    filter: (cls: any) => boolean = () => true
  ) {
    const results: ComponentWrapper[] = [];

    this.registry.forEach((config, cls) => {
      if (config.condition && ! config.condition()) {
        return;
      }

      scope.querySelectorAll(config.selector).forEach(element => {
        if (filter(cls) && element instanceof HTMLElement) {
          const cmp = new cls(element);
          const wrapper: ComponentWrapper = { component: cmp, element };

          if (typeof cmp.onListen === 'function') {
            wrapper.unlisten = cmp.onListen();
          }

          results.push(wrapper);

          this.components.push(wrapper);
        }
      });
    });

    if (purge) {
      this.purge(scope);
    }

    return results;
  }

  public static purge(scope: HTMLElement = this.root) {
    const indicies: number[] = [];

    this.components.forEach((wrapper, index) => {
      if ( ! scope.contains(wrapper.element)) {
        if (wrapper.unlisten) {
          wrapper.unlisten();
          delete wrapper.unlisten;
        }

        if (typeof wrapper.component.onDestroy === 'function') {
          wrapper.component.onDestroy();
        }

        indicies.push(index);
      }
    });

    indicies.forEach(index => this.components.splice(index, 1));
  }

  public static query<T>(ctor: T, scope?: HTMLElement) {
    const results: ComponentWrapper<T>[] = [];

    this.components.forEach(wrapper => {
      if (
        scope &&
        ! scope.contains(wrapper.element) &&
        wrapper.element !== scope
      ) {
        return;
      }

      if (wrapper.component instanceof (ctor as any)) {
        results.push({ ...wrapper });
      }
    });

    return results;
  }
}
