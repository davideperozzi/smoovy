import { Coordinate, objectDeepClone, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom } from './dom';

export interface ScrollerOutputConfig {}
export interface ScrollerOutputConfigOverride {}

export abstract class ScrollerOutput<
  C extends ScrollerOutputConfig = ScrollerOutputConfig,
  O extends ScrollerOutputConfigOverride = ScrollerOutputConfigOverride
> {
  public __configOverrideType: O;
  public config: C = {} as C;

  public constructor(
    protected dom: ScrollerDom,
    public userConfig?: Partial<C>
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

  public get defaultConfig(): C {
    return {} as C;
  }

  public recalc() {}

  public abstract attach(): void;
  public abstract detach(): void;
  public abstract update(position: Coordinate): void;
}
