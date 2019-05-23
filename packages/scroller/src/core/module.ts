import { Coordinate } from '@smoovy/utils';

import { ScrollerDom } from './dom';
import { ScrollerInput, ScrollerInputState } from './input';
import { ScrollerOutput } from './output';
import { ScrollerTransformer } from './transformer';

export interface ScrollerModuleConfig<I = {}, O = {}, T = {}> {
  input: { [K in keyof I]: I[K] };
  output: { [K in keyof O]: O[K] };
  transformer: { [K in keyof T]: T[K] };
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

    this.inputs.forEach((input) => {
      input.subscribe(state => this.updateInput(state));
      input.attach();
    });

    this.outputs.forEach((output) => output.attach());
  }

  public detach() {
    this.inputs.forEach((input) => {
      input.unsubscribeAll();
      input.detach();
    });

    this.outputs.forEach((output) => output.detach());
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
