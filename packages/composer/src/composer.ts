import { ComponentWrapper } from './component';
import { defineInjectors, inject } from './injector';
import { Service, serviceInjector } from './service';

export interface ComposerConfig {
  root?: HTMLElement;
  services?: Service[];
  components?: any[];
  initUpdate?: boolean;
}

const composerInjector = Symbol(undefined);

export function composer(config?: ComposerConfig) {
  return (target: any, propertyKey?: string) => {
    if ( ! propertyKey) {
      const manager = new Composer(config);

      return class extends target {
        constructor() {
          super();

          inject(composerInjector, this, [manager]).then(() => {
            if (typeof this.onCreate === 'function') {
              this.onCreate();
            }
          });
        }
      }
    } else {
      return defineInjectors(composerInjector, { class: Composer })(
        target,
        propertyKey
      );
    }
  };
}

export class Composer {
  private root = document.body;
  private components: ComponentWrapper[] = [];

  constructor(
    private config: ComposerConfig = {}
  ) {
    const services = this.config.services;

    if (services) {
      for (let i = 0, len = services.length; i < len; i++) {
        inject(serviceInjector, services[i], this.config.services)
      }

      for (let i = 0, len = services.length; i < len; i++) {
        services[i].activate();
      }

      for (let i = 0, len = services.length; i < len; i++) {
        services[i].init();
      }
    }

    if (config.initUpdate !== false) {
      this.update();
    }
  }

  private async inject(wrapper: ComponentWrapper) {
    await Promise.all([
      inject(composerInjector, wrapper.component, [this]),
      inject(serviceInjector, wrapper.component, this.config.services)
    ]);

    return wrapper;
  }

  public update(
    scope: HTMLElement = this.root,
    purge = true,
    filter: (cls: any) => boolean = () => true
  ) {
    const results: ComponentWrapper[] = [];

    this.collect(scope, filter, (wrapper) => {
      this.inject(wrapper).then(() => {
        let created = Promise.resolve();

        if (typeof wrapper.component.onCreate === 'function') {
          const createRet = wrapper.component.onCreate();

          if (createRet instanceof Promise)  {
            created = createRet;
          }
        }

        if (typeof wrapper.component.onListen === 'function') {
          created.then(async () => {
            const unlisten = wrapper.component.onListen();

            if (unlisten instanceof Promise) {
              wrapper.unlisten = await unlisten;
            } else {
              wrapper.unlisten = unlisten;
            }
          });
        }
      });

      results.push(wrapper);
      this.components.push(wrapper);
    });

    if (purge) {
      this.purge();
    }

    return results;
  }

  private collect(
    scope: HTMLElement,
    filter: (cls: any) => boolean,
    cb: (wrapper: ComponentWrapper) => void
  ) {
    (this.config.components || []).forEach((Clazz) => {
      const config = Reflect.get(Clazz, '__config') || {};

      if (config.condition && ! config.condition()) {
        return;
      }

      scope.querySelectorAll(config.selector).forEach(element => {
        if (
          filter(Clazz) &&
          element instanceof HTMLElement &&
          ! this.components.find(wrapper => (
            wrapper.component instanceof Clazz as any &&
            wrapper.element === element
          ))
        ) {
          cb({ ctor: Clazz, component: new Clazz(element), config, element });
        }
      });
    });
  }

  public purge() {
    const removes: [ComponentWrapper, Promise<void>][] = [];

    this.components.forEach((wrapper) => {
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

  public query<T>(ctor: T, scope?: HTMLElement) {
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
