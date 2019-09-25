import { Coordinate } from '@smoovy/utils';

import { ScrollerDom } from './dom';
import { ScrollerInput, ScrollerInputState } from './input';
import { ScrollerOutput } from './output';
import { ScrollerTransformer } from './transformer';

type EachCallback<T> = (value: T, key: string) => void;
interface ScrollerModuleItem<T> {
  [key: string]: T;
}

export type InputListener = (pos: Coordinate) => void;
export type OutputListener = (pos: Coordinate) => void;
export type RecalcListener = (
  virtualPos: Coordinate,
  outputPos: Coordinate
) => void;

export type ModuleActionListener =
  InputListener |
  OutputListener |
  RecalcListener;

export interface ScrollerModuleConfig<
  I extends ScrollerModuleItem<ScrollerInput> = {},
  O extends ScrollerModuleItem<ScrollerOutput> = {},
  T extends ScrollerModuleItem<ScrollerTransformer> = {}
> {
  mapDelta?: (delta: Coordinate) => Coordinate;
  on?: {
    input?: InputListener,
    output?: OutputListener,
    recalc?: RecalcListener
  };
  input: Partial<{
    [K in keyof I]: Partial<I[K]['config']>
  }>;
  output: Partial<{
    [K in keyof O]: Partial<O[K]['config']>
  }>;
  transformer: Partial<{
    [K in keyof T]: Partial<T[K]['config']>
  }>;
}

export interface ScrollerModuleConfigOverride<
  O extends ScrollerModuleItem<ScrollerOutput> = {},
  T extends ScrollerModuleItem<ScrollerTransformer> = {}
> {
  output?: Partial<{
    [K in keyof O]: Partial<O[K]['__configOverrideType']>
  }>;
  transformer?: Partial<{
    [K in keyof T]: Partial<T[K]['__configOverrideType']>
  }>;
}

export class ScrollerModule<
  C extends ScrollerModuleConfig = ScrollerModuleConfig
> {
  public inputs: ScrollerModuleItem<ScrollerInput> = {};
  public outputs: ScrollerModuleItem<ScrollerOutput> = {};
  public transformers: ScrollerModuleItem<ScrollerTransformer> = {};
  private inputListeners: InputListener[] = [];
  private outputListeners: OutputListener[] = [];
  private recalcListeners: RecalcListener[] = [];
  private virtualPosition: Coordinate;
  private outputPosition: Coordinate;
  private inputsDisabled: boolean = false;

  public constructor(
    protected dom: ScrollerDom,
    public config: C
  ) {
    if (config.on) {
      if (typeof config.on.input === 'function') {
        this.onInput(config.on.input);
      }

      if (typeof config.on.output === 'function') {
        this.onOutput(config.on.output);
      }

      if (typeof config.on.recalc === 'function') {
        this.onRecalc(config.on.recalc);
      }
    }
  }

  public init() {}

  public attach(
    virtualPosition: Coordinate,
    outputPosition: Coordinate
  ) {
    this.virtualPosition = virtualPosition;
    this.outputPosition = outputPosition;

    this.eachOutput((output) => output.attach());
    this.eachInput((input) => {
      input.subscribe(state => this.updateInput(state));
      input.attach();
    });

    setTimeout(() => this.updateInput({ delta: { x: 0, y: 0 } }));
  }

  public detach() {
    this.eachInput((input) => {
      input.unsubscribeAll();
      input.detach();
    });

    this.eachOutput((output) => {
      output.detach();
    });
  }

  public eachInput(cb: EachCallback<ScrollerInput>) {
    Object.keys(this.inputs).forEach(
      (key) => cb.call(this, this.inputs[key], key)
    );
  }

  public eachOutput(cb: EachCallback<ScrollerOutput>) {
    Object.keys(this.outputs).forEach(
      (key) => cb.call(this, this.outputs[key], key)
    );
  }

  public eachTransformer(cb: EachCallback<ScrollerTransformer>) {
    Object.keys(this.transformers).forEach(
      (key) => cb.call(this, this.transformers[key], key)
    );
  }

  public onInput(listener: InputListener) {
    return this.attachListener(this.inputListeners, listener);
  }

  public onOutput(listener: OutputListener) {
    return this.attachListener(this.outputListeners, listener);
  }

  public onRecalc(listener: RecalcListener) {
    return this.attachListener(this.recalcListeners, listener);
  }

  private attachListener(
    stack: ModuleActionListener[],
    listener: ModuleActionListener
  ) {
    stack.push(listener);

    return {
      remove: () => this.removeListener(stack, listener)
    };
  }

  private removeListener<L>(
    stack: ModuleActionListener[],
    listener: ModuleActionListener
  ) {
    const index = stack.indexOf(listener);

    /* istanbul ignore else */
    if (index > -1) {
      stack.splice(index, 1);
    }
  }

  public enableInputs(enabled: boolean = true) {
    this.inputsDisabled = !enabled;
  }

  public recalc(async = false) {
    const recalc = () => {
      this.updateInput({ delta: { x: 0, y: 0 } });
      this.eachInput((input) => input.recalc());
      this.eachOutput((output) => output.recalc());
      this.eachTransformer((transformer) => transformer.recalc());
      this.updateInput({ delta: { x: 0, y: 0 } });

      for (let i = 0, len = this.recalcListeners.length; i < len; i++) {
        this.recalcListeners[i].call(
          this,
          this.virtualPosition,
          this.outputPosition
        );
      }
    };

    if (async) {
      setTimeout(() => recalc());
    } else {
      recalc();
    }
  }

  public updatePosition<
    O extends ScrollerModuleItem<ScrollerOutput>,
    T extends ScrollerModuleItem<ScrollerTransformer>
  >(
    position?: Partial<Coordinate>,
    configOverride?: ScrollerModuleConfigOverride<O, T>
  ) {
    if (position && typeof position.x !== 'undefined') {
      this.virtualPosition.x = position.x;
    }

    if (position && typeof position.y !== 'undefined') {
      this.virtualPosition.y = position.y;
    }

    const transformerKeys = Object.keys(this.transformers);
    const outputConfigRestore: Function[] = [];
    const transformerConfigRestore: Function[] = [];

    if (configOverride) {
      if (configOverride.transformer) {
        const keys = Object.keys(configOverride.transformer);

        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i];

          if (this.transformers.hasOwnProperty(key)) {
            transformerConfigRestore.push(
              this.transformers[key].overrideConfig(
                configOverride.transformer[key] as any
              )
            );
          }
        }
      }

      if (configOverride.output) {
        const keys = Object.keys(configOverride.output);

        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i];

          if (this.outputs.hasOwnProperty(key)) {
            outputConfigRestore.push(
              this.outputs[key].overrideConfig(
                configOverride.output[key] as any
              )
            );
          }
        }
      }
    }

    for (let i = 0, len = transformerKeys.length; i < len; i++) {
      this.transformers[transformerKeys[i]].virtualTransform(
        this.virtualPosition
      );
    }

    for (let i = 0, len = this.inputListeners.length; i < len; i++) {
      this.inputListeners[i].call(this, this.virtualPosition);
    }

    let transformersEnded = 0;

    for (let i = 0, len = transformerKeys.length; i < len; i++) {
      const key = transformerKeys[i];

      this.transformers[key].outputTransform(
        this.outputPosition,
        () => this.updateOutput(),
        () => {
          transformersEnded++;

          if (outputConfigRestore.length > 0 && transformersEnded === len) {
            outputConfigRestore.forEach(restore => restore.call(this));
          }
        }
      );
    }

    if (transformerConfigRestore.length > 0) {
      transformerConfigRestore.forEach((restore) => restore.call(this));
    }
  }

  protected updateInput(state: ScrollerInputState) {
    if (this.inputsDisabled) {
      return;
    }

    if (typeof this.config.mapDelta === 'function') {
      state.delta = this.config.mapDelta.call(this, state.delta);
    }

    this.virtualPosition.x -= state.delta.x;
    this.virtualPosition.y -= state.delta.y;

    this.updatePosition();
  }

  protected updateOutput() {
    const outputKeys = Object.keys(this.outputs);

    for (let i = 0, len = outputKeys.length; i < len; i++) {
      this.outputs[outputKeys[i]].update(this.outputPosition);
    }

    for (let i = 0, len = this.outputListeners.length; i < len; i++) {
      this.outputListeners[i].call(this, this.outputPosition);
    }
  }
}
