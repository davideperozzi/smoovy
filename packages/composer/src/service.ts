import { defineInjectors } from "./injector";

export const serviceInjector = Symbol(undefined);

export function service(service: new () => Service, async = false) {
  return defineInjectors(serviceInjector, { class: service, async });
}

export class Service<
  T = any,
  F extends Service = any,
  C extends Record<string, unknown> = any
> extends Promise<T> {
  private children = new Map<string, Service<T, F>>();
  private _resolved = false;
  private _activated = false;
  protected defaultConfig: Partial<C> = {} as C;
  public resolveFn?: (value?: T | PromiseLike<T>) => void;
  public rejectFn?: (reason?: any) => void;

  constructor(
    protected config: C = {} as C,
    value?: T
  ) {
    let resolveFn: any;
    let rejectFn: any;

    super((resolve, reject) => {
      resolveFn = resolve as any;
      rejectFn = reject;
    });

    this.config = { ...this.defaultConfig, ...config };
    this.resolveFn = resolveFn;
    this.rejectFn = rejectFn;

    if (value) {
      this.resolve(value);
    }
  }

  static get [Symbol.species]() {
    return Promise;
  }

  protected get child(): new (config: C, value?: T) => F {
    return Service as any;
  }

  addChild(name: string, config: C = {} as C, value?: T) {
    // eslint-disable-next-line new-cap
    const service = new this.child(config, value);

    this.children.set(name, service);

    return service as F;
  }

  deleteChild(name: string | F) {
    let key;

    if (typeof name === 'string') {
      key = name;
    } else {
      this.children.forEach((value, childName) => {
        if (name === value) {
          key = childName;
        }
      });
    }

    if (key) {
      return this.children.delete(key);
    }

    return false;
  }

  hasChild(name: string) {
    return this.children.has(name);
  }

  getChild(name?: string, fallback?: F): Service<T, F, C> | undefined {
    if ( ! name || ! this.hasChild(name) && fallback) {
      return fallback;
    }

    return this.children.get(name);
  }

  public get available() {
    return this._resolved;
  }

  public get activated() {
    return this._activated;
  }

  public activate() {
    this._activated = true;

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async init() {}

  public resolve(value: T) {
    if (this.resolveFn && ! this._resolved) {
      this._resolved = true;
      this.resolveFn(value);
    }

    return value;
  }
}
