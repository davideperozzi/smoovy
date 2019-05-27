import { Coordinate, objectDeepClone, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom } from './dom';

export interface ScrollerTransformerConfig {}

export abstract class ScrollerTransformer<
  C extends ScrollerTransformerConfig = ScrollerTransformerConfig
> {
  protected config: C = {} as C;

  public constructor(
    protected dom: ScrollerDom,
    config?: Partial<C>
  ) {
    this.config = objectDeepClone(this.defaultConfig);

    if (config) {
      objectDeepMerge(this.config, config);
    }
  }

  public get defaultConfig(): C {
    return {  } as C;
  }

  public abstract recalc(): void;
  public abstract virtualTransform(position: Coordinate): void;
  public abstract outputTransform(
    position: Coordinate,
    update: () => void
  ): void;
}
