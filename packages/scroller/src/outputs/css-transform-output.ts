import { Coordinate, Browser } from '@smoovy/utils';

import { ScrollerOutput, ScrollerOutputConfig } from '../core/output';

export interface CssTransformOutputConfig extends ScrollerOutputConfig {
  firefoxFix: boolean;
}

export class CssTransformOutput<
  C extends CssTransformOutputConfig = CssTransformOutputConfig
> extends ScrollerOutput<C> {
  public get defaultConfig() {
    return {
      firefoxFix: true
    } as C;
  }

  public attach() {}
  public detach() {
    this.dom.wrapper.style.transform = '';
  }

  public update(position: Coordinate) {
    let transform = `translate3d(${-position.x}px, ${-position.y}px, 0)`;

    if (Browser.firefox && this.config.firefoxFix) {
      transform += ` rotate3d(0.01, 0.01, 0.01, 0.01deg)`;
    }

    this.dom.wrapper.style.transform = transform;
  }
}
