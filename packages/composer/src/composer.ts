import { componentConfigKey, ComponentWrapper } from './component';
import { configInjector } from './config';
import { defineInjectors, inject, injectInstances } from './injector';
import { queryAllInjector, queryInjector } from './query';
import { Service, serviceInjector } from './service';

export interface ComposerConfig {
  root?: HTMLElement;
  services?: Service[];
  components?: any[];
  initUpdate?: boolean;
}

const composerInjector = Symbol(undefined);
const parseJson = (text?: string, defaultValue = {}, warn = false) => {
  let result: any = defaultValue;

  if (text) {
    try {
      result = JSON.parse(text);
    } catch(err) {
      if (warn) {
        console.warn(`could not parse json:`, err);
      }
    }
  }

  return result;
};

export function composer(config?: ComposerConfig) {
  return (target: any, propertyKey?: string) => {
    if ( ! propertyKey) {
      const manager = new Composer(config);

      return class extends target {
        constructor() {
          super();

          Promise.all([
            injectInstances(composerInjector, this, [manager]),
            ...manager.services.map(service => injectInstances(
              composerInjector,
              service,
              [manager]
            )),
            injectInstances(
              serviceInjector,
              this,
              manager.services,
              true,
              manager.voidService
            )
          ]).then(() => {
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
  public readonly voidService = new Service();

  constructor(
    private config: ComposerConfig = {}
  ) {
    this.initServices();

    if (config.initUpdate !== false) {
      this.update();
    }
  }

  get services() {
    return this.config.services || [];
  }

  private async initServices() {
    const services = this.config.services;

    if (services) {
      const serviceNames = services.map(svc => svc.name);

      if (serviceNames.length !== new Set(serviceNames).size) {
        throw new Error('duplicate services found: ' + serviceNames.join(', '));
      }

      for (let i = 0, len = services.length; i < len; i++) {
        services[i].activate();
      }

      for (let i = 0, len = services.length; i < len; i++) {
        await this.injectService(services[i]);
      }

      for (let i = 0, len = services.length; i < len; i++) {
        services[i].init();
      }
    }
  }

  public async injectService(service: Service) {
    await injectInstances(
      serviceInjector,
      service,
      this.config.services,
      true,
      this.voidService
    );
  }

  public async injectComponent(wrapper: ComponentWrapper) {
    await Promise.all([
      injectInstances(composerInjector, wrapper.component, [this]),
      injectInstances(
        serviceInjector,
        wrapper.component,
        this.config.services,
        false,
        this.voidService
      ),
      inject(queryInjector, wrapper.component, async (name, config, target) => {
        const component = config.selector[componentConfigKey];
        const selector = component ? component.selector : config.selector;
        let result = config.closest
          ? wrapper.element.closest(selector)
          : wrapper.element.querySelector(selector);

        if (component) {
          result = this.components.find(({ element }) => element === result)?.component;
        }

        if (typeof config.parse === 'function') {
          result = config.parse(result);
        }

        if (result) {
          target[name] = result;
        }
      }),
      inject(
        queryAllInjector,
        wrapper.component,
        async (name, config, target) => {
          const componentCfg = config.selector[componentConfigKey];
          const selector = componentCfg ? componentCfg.selector : config.selector;
          let result: any = wrapper.element.querySelectorAll(selector);

          if (componentCfg) {
            const elements = Array.from(result);

            result = this.components
              .filter(({ element }) => elements.includes(element))
              .map(({ component }) => component);
          }

          if (typeof config.parse === 'function') {
            result = config.parse(result);
          }

          if (result) {
            target[name] = result;
          }
        }
      ),
      inject(
        configInjector,
        wrapper.component,
        async (name, config, target) => this.parseComponentConfig(
          wrapper,
          name,
          config,
          target
        )
      )
    ]);

    return wrapper;
  }

  private parseComponentConfig(
    wrapper: ComponentWrapper,
    name: string,
    config: any,
    target: any
  ) {
    const clazz = wrapper.ctor as any;
    const dataset = clazz[componentConfigKey].dataset;

    if ( ! dataset) {
      throw new Error(
        `${clazz.name} component has no dataset attribute defined. ` +
        `Define it with "dataset" in the component decorator.`
      );
    }

    const dataStr = wrapper.element.dataset[dataset];
    const keyCam = config.key.replace(/-./g, (x: string) => x[1].toUpperCase());
    const keyDat = keyCam.charAt(0).toUpperCase() + keyCam.slice(1);
    const dataValue = wrapper.element.dataset[`${dataset}${keyDat}`];
    const dataObj = dataStr ? parseJson(dataStr) : {};
    const parser = config.type || String;
    const plainVal = dataValue === undefined ? dataObj[config.key] : dataValue;

    if (plainVal !== undefined) {
      let value: any;

      if (parser === Array) {
        value = [];
      } else if (parser === Object) {
        value = {};
      } else {
        value = parser(plainVal);
      }

      if (
        parser === Boolean &&
        typeof plainVal === 'string' &&
        plainVal.trim() === ''
      ) {
        value = true;
      }

      if (
        parser === Boolean &&
        (
          plainVal === '0' ||
          plainVal === 'no' ||
          plainVal === 'false'
        )
      ) {
        value = false;
      }

      if (parser === Array) {
        if (plainVal instanceof Array) {
          value = plainVal;
        } else if (typeof plainVal === 'string' && plainVal.startsWith('[')) {
          value = parseJson(plainVal, [], true);
        }
      } else if (parser === Object) {
        if (plainVal instanceof Object) {
          value = plainVal;
        } else if (typeof plainVal === 'string' && plainVal.startsWith('{')) {
          value = parseJson(plainVal, {}, true);
        }
      }

      if (typeof config.parse === 'function') {
        value = config.parse(value);
      }

      target[name] = value;
    }
  }

  update(
    scope: HTMLElement = this.root,
    purge = true,
    filter: (cls: any) => boolean = () => true
  ) {
    const wrappers = this.collect(scope, filter, (wrapper) => {
      this.components.push(wrapper);
    });

    for (const wrapper of wrappers) {
      this.injectComponent(wrapper).then(() => {
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
    }

    if (purge) {
      this.purge();
    }

    return wrappers;
  }

  private collect(
    scope: HTMLElement,
    filter: (cls: any) => boolean,
    cb: (wrapper: ComponentWrapper) => void
  ) {
    const result: ComponentWrapper[] = [];

    (this.config.components || []).forEach((Clazz) => {
      const config = Clazz[componentConfigKey] || {};

      if (config.condition && ! config.condition()) {
        return;
      }

      const nodes = Array.from(scope.querySelectorAll(config.selector));

      if (scope.matches(config.selector)) {
        nodes.unshift(scope);
      }

      nodes.forEach(element => {
        if (
          filter(Clazz) &&
          element instanceof HTMLElement &&
          ! this.components.find(wrapper => (
            wrapper.component instanceof Clazz as any &&
            wrapper.element === element
          ))
        ) {
          const wrapper: ComponentWrapper = {
            ctor: Clazz,
            component: new Clazz(element),
            config,
            element
          };

          cb(wrapper)
          result.push(wrapper);
        }
      });
    });

    return result;
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

  query<T>(ctor: new(...args: any[]) => T, scope?: HTMLElement) {
    return this.components
      .filter(wrapper => wrapper.component instanceof (ctor as any))
      .filter(wrapper => scope ? scope.contains(wrapper.element) : true)
      .map(wrapper => ({ ...wrapper }))
  }
}