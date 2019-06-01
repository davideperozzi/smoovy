import { Coordinate, objectDeepClone, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom } from './dom';

export interface ScrollerTransformerConfig {}
export interface ScrollerTransformerConfigOverride {}

export abstract class ScrollerTransformer<
  C extends ScrollerTransformerConfig = ScrollerTransformerConfig,
  O extends
    ScrollerTransformerConfigOverride = ScrollerTransformerConfigOverride
> {
  public __configOverrideType: O;
  public config: C = {} as C;

  public constructor(
    protected dom: ScrollerDom,
    protected userConfig?: Partial<C>,
  ) {
    this.config = objectDeepClone(this.defaultConfig);

    if (userConfig) {
      objectDeepMerge(this.config, userConfig);
    }
  }

  public overrideConfig(config: O) {
    this.config = objectDeepMerge(this.config, config);

    return () => {
      this.config = objectDeepMerge(
        this.config,
        this.userConfig || this.defaultConfig
      );
    };
  }

  public get defaultConfig() {
    return {} as C;
  }

  public recalc() {}

  public abstract virtualTransform(position: Coordinate): void;
  public abstract outputTransform(
    position: Coordinate,
    update: () => void,
    complete: () => void
  ): void;
}
