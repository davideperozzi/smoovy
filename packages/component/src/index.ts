import { Unlisten } from '@smoovy/event';
import { create } from 'domain';

export interface Component extends OnDestroy, OnListen {}

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
  config: ComponentConfig;
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
        if (
          filter(cls) &&
          element instanceof HTMLElement &&
          ! this.components.find(wrapper => (
            wrapper.component instanceof cls as any &&
            wrapper.element === element
          ))
        ) {
          const cmp = new cls(element);
          const wrapper: ComponentWrapper = { component: cmp, element, config };
          let created = Promise.resolve();

          if (typeof cmp.onCreate === 'function') {
            const createRet = cmp.onCreate();

            if (createRet instanceof Promise)  {
              created = createRet;
            }
          }

          if (typeof cmp.onListen === 'function') {

            created.then(async () => {
              const unlisten = cmp.onListen();

              if (unlisten instanceof Promise) {
                wrapper.unlisten = await unlisten;
              } else {
                wrapper.unlisten = unlisten;
              }
            });
          }

          results.push(wrapper);

          this.components.push(wrapper);
        }
      });
    });

    if (purge) {
      this.purge();
    }

    return results;
  }

  public static purge() {
    const removes: [ComponentWrapper, Promise<void>][] = [];

    this.components.forEach((wrapper, index) => {
      if (
        ! this.root.contains(wrapper.element) ||
        ! wrapper.element.matches(wrapper.config.selector)
      ) {
        let promise = Promise.resolve();

        if (typeof wrapper.component.onDestroy === 'function') {
          const destroy = wrapper.component.onDestroy();

          if (destroy instanceof Promise) {
            promise = destroy;
          }
        }

        promise.then(() => {
          if (typeof wrapper.unlisten === 'function') {
            wrapper.unlisten();
            delete wrapper.unlisten;
          }
        });

        removes.push([wrapper, promise]);
      }
    });

    for (let i = removes.length - 1; i >= 0; i--) {
      removes[i][1].then(() => {
        const index = this.components.indexOf(removes[i][0]);

        if (index > -1) {
          this.components.splice(index, 1);
        }
      });
    }
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
