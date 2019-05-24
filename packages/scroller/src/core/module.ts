import { Coordinate } from '@smoovy/utils';

import { ScrollerDom } from './dom';
import { ScrollerInput, ScrollerInputState } from './input';
import { ScrollerOutput } from './output';
import { ScrollerTransformer } from './transformer';

export interface ScrollerModuleConfig<I = {}, O = {}, T = {}> {
  input: { [K in keyof I]: Partial<I[K]> };
  output: { [K in keyof O]: Partial<O[K]> };
  transformer: { [K in keyof T]: Partial<T[K]> };
}

export class ScrollerModule<
  C extends ScrollerModuleConfig = ScrollerModuleConfig
> {
  public inputs: ScrollerInput[] = [];
  public outputs: ScrollerOutput[] = [];
  public transformers: ScrollerTransformer[] = [];
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

    this.outputs.forEach((output) => output.attach());
    this.inputs.forEach((input) => {
      input.subscribe(state => this.updateInput(state));
      input.attach();
    });

    setTimeout(() => this.updateInput({ delta: { x: 0, y: 0 } }));
  }

  public detach() {
    this.inputs.forEach((input) => {
      input.unsubscribeAll();
      input.detach();
    });

    this.outputs.forEach((output) => output.detach());
  }

  public output<T extends ScrollerOutput>(ctor: new(...args: any[]) => T) {
    const output = this.outputs.find(o => o instanceof ctor);

    if ( ! output) {
      throw new Error(`Output "${ctor.name}" not found`);
    }

    return output as any as T;
  }

  public input<T extends ScrollerInput>(ctor: new(...args: any[]) => T) {
    const input = this.inputs.find(o => o instanceof ctor);

    if ( ! input) {
      throw new Error(`Input "${ctor.name}" not found`);
    }

    return input as any as T;
  }

  public transformer<T extends ScrollerTransformer>(
    ctor: new(...args: any[]) => T
  ) {
    const transformer = this.transformers.find(o => o instanceof ctor);

    if ( ! transformer) {
      throw new Error(`Transformer "${ctor.name}" not found`);
    }

    return transformer as any as T;
  }

  protected updateInput(state: ScrollerInputState) {
    this.virtualPosition.x -= state.delta.x;
    this.virtualPosition.y -= state.delta.y;

    for (let i = 0, len = this.transformers.length; i < len; i++) {
      this.transformers[i].virtualTransform(this.virtualPosition);
    }

    for (let i = 0, len = this.transformers.length; i < len; i++) {
      this.transformers[i].outputTransform(
        this.outputPosition,
        () => this.updateOutput()
      );
    }
  }

  protected updateOutput() {
    for (let i = 0, len = this.outputs.length; i < len; i++) {
      this.outputs[i].update(this.outputPosition);
    }
  }
}
