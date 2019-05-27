import { Coordinate, objectDeepClone, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom } from './dom';

export interface ScrollerOutputConfig { }

export abstract class ScrollerOutput<
C extends ScrollerOutputConfig = ScrollerOutputConfig
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

  public abstract attach(): void;
  public abstract detach(): void;
  public abstract recalc(): void;
  public abstract update(position: Coordinate): void;
}
