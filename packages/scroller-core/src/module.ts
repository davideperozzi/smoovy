import { Coordinate } from '@smoovy/utils';

import { ScrollerDom } from './dom';
import { ScrollerInput, ScrollerInputState } from './input';
import { ScrollerOutput } from './output';
import { ScrollerTransformer } from './transformer';

type EachCallback<T> = (value: T, key: string) => void;
interface ScrollerModuleItem<T> {
  [key: string]: T;
}

export interface ScrollerModuleConfig<
  I extends ScrollerModuleItem<ScrollerInput> = {},
  O extends ScrollerModuleItem<ScrollerOutput> = {},
  T extends ScrollerModuleItem<ScrollerTransformer> = {}
> {
  mapDelta?: (delta: Coordinate) => Coordinate;
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
  private virtualPosition: Coordinate;
  private outputPosition: Coordinate;

  public constructor(
    protected dom: ScrollerDom,
    public config: C
  ) {}

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

  public recalc() {
    this.updateInput({ delta: { x: 0, y: 0 } });
    this.eachInput((input) => input.recalc());
    this.eachOutput((output) => output.recalc());
    this.eachTransformer((transformer) => transformer.recalc());
    this.updateInput({ delta: { x: 0, y: 0 } });
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
  }
}
