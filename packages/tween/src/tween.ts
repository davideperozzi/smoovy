import { TweenController, TweenControllerConfig } from './controller';
import { getDomProps, mergeDomProps, setDomProps } from './dom';
import { DOMTweenProps, TweenProps } from './props';

export interface TweenConfig<
  V extends (TweenProps | object)
> extends TweenControllerConfig {
  from: V | HTMLElement;
  to: Partial<V>;
  key?: any;
  target?: V | HTMLElement;
  recover?: boolean;
  units?: Record<string, string>;
  mutate?: boolean;
  overwrite?: boolean;
  onOverwrite?: () => void;
  onUpdate?: (
    values: V,
    state: {
      target: Tween<V>,
      linear: number,
      eased: number
    }
  ) => void;
}

export type SimpleTweenConfig<V extends (TweenProps | object)>
  = Omit<TweenConfig<V>, 'from' | 'to'>;

function getChanges<T extends (TweenProps | object)>(from: T, to: Partial<T>) {
  const changes = {} as typeof to;

  for (const key in from) {
    if (
      Object.prototype.hasOwnProperty.call(from, key) &&
      Object.prototype.hasOwnProperty.call(to, key)
    ) {
      const change = (to[key] as number) - (from as any)[key];

      if (change !== 0) {
        changes[key] = change as any;
      }
    }
  }

  return changes;
}

/** @todo improve typing (prevent any) */
export class Tween<
  T extends (TweenProps | object) = TweenProps
> extends TweenController<TweenConfig<T>> {
  private static registry = new WeakMap<any, Tween>();
  private static recovers = new WeakMap<any, Partial<TweenProps>>();
  private registry = Tween.registry;
  private originState: Partial<T> = {};
  private changedState: Partial<T> = {};
  private resultState: Partial<T> = {};
  private domTarget?: HTMLElement;

  constructor(
    protected config: TweenConfig<T>
  ) {
    super(config);

    this.update();
  }

  public get key() {
    return this.config.key || this.config.target || this.config.from;
  }

  private overwrite(key: T) {
    const tween = this.registry.get(key);

    if (tween instanceof Tween) {
      tween.stop();
      this.registry.delete(key);
      this.callback(this.config.onOverwrite);
    }
  }

  update() {
    const config = this.config;
    let fromState = config.from;

    if (config.target && config.target instanceof HTMLElement) {
      this.domTarget = config.target;
    } else if (fromState instanceof HTMLElement) {
      this.domTarget = fromState;
    }

    if (config.recover !== false && ! (fromState instanceof HTMLElement)) {
      const lastTween = Tween.registry.get(this.key);

      if (lastTween) {
        fromState = lastTween.resultState as any;
      }
    }

    if (this.domTarget) {
      const currentState = getDomProps(this.domTarget);
      const initialState = fromState instanceof HTMLElement
        ? { ...currentState }
        : mergeDomProps(currentState, fromState as any as DOMTweenProps);
      const desiredState = mergeDomProps(
        currentState,
        config.to as any as DOMTweenProps
      );
      const changedState = getChanges(initialState, desiredState);

      this.originState = initialState as any as Partial<T>;
      this.changedState = changedState as any as Partial<T>;
      this.resultState = { ...this.originState };
    }
    else {
      const initialState = fromState as any as Partial<T>;
      const desiredState = config.to as any as Partial<T>;

      this.originState = { ...initialState };
      this.changedState = getChanges<T>(this.originState as T, desiredState);

      if (config.target && ! (config.target instanceof HTMLElement)) {
        this.resultState = config.target;
      } else {
        this.resultState = config.mutate !== false
          ? initialState
          : { ...this.originState };
      }
    }

    return this;
  }

  protected beforeSeek() {
    this.update();

    if (this.registry.has(this.key) && this.config.overwrite !== false) {
      this.overwrite(this.key);
    }

    this.registry.set(this.key, this as any);
  }

  process(eased: number, linear: number) {
    for (const prop in this.changedState) {
      if (Object.prototype.hasOwnProperty.call(this.changedState, prop)) {
        const change = this.changedState[prop] as number;
        const origin = this.originState[prop] as number;

        if (typeof origin !== undefined) {
          (this.resultState[prop] as any) = origin + change * eased;
        }
      }
    }

    if (this.domTarget) {
      setDomProps(this.domTarget, this.resultState as any, this.config.units);
    }

    this.callback(
      this.config.onUpdate,
      [ this.resultState, { target: this, linear, eased } ]
    );

    return this;
  }
}
