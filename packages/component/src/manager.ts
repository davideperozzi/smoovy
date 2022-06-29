import { Component, ComponentConfig } from './component';

export type ComponentResult<T = any> = { component: T, element: HTMLElement }[];

export function component(config: ComponentConfig) {
  return (target: any) => {
    ComponentManager.register(target, config);

    return target;
  };
}

export class ComponentManager {
  private static root = document.body;
  private static registry = new Map<any, ComponentConfig>();
  private static components = new Map<HTMLElement, Component>();

  public static register(cls: any, config: ComponentConfig) {
    this.registry.set(cls, config);
  }

  public static update(
    scope?: HTMLElement,
    purge = true,
    filter: (cls: any) => boolean = () => true
  ) {
    const results: ComponentResult = [];

    this.registry.forEach((config, cls) => {
      if (config.condition && ! config.condition()) {
        return;
      }

      (scope || this.root).querySelectorAll(config.selector).forEach(el => {
        if (
          filter(cls) &&
          el instanceof HTMLElement &&
          ! this.components.has(el)
        ) {
          const cmp = new cls(el);

          results.push({ component: cmp, element: el });
          this.components.set(el, cmp);
        }
      });
    });

    if (purge) {
      this.components.forEach((cmp, el) => {
        if ( ! this.root.contains(el)) {
          if (typeof cmp.onDestroy === 'function') {
            cmp.onDestroy();
          }

          this.components.delete(el);
        }
      });
    }

    return results;
  }

  public static query<T>(ctor: T, scope?: HTMLElement) {
    const results: ComponentResult = [];

    this.components.forEach((cmp, element) => {
      if (scope && ! scope.contains(element) && element !== scope) {
        return;
      }

      if (cmp instanceof (ctor as any)) {
        results.push({ component: cmp, element });
      }
    });

    return results;
  }
}
