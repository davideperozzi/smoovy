import { ScrollerModule } from '@smoovy/scroller-core';
import {
  ClampTransformer, CssTransformOutput, MouseWheelInput,
} from '@smoovy/scroller-shared';

import { TweenTransformer } from './transformers/tween-transformer';

export class ScrollerTweenModule extends ScrollerModule<any> {
  public inputs = {
    mouseWheel: new MouseWheelInput(
      this.dom,
      this.config.input.mouseWheel
    )
  };

  public outputs = {
    cssTransform: new CssTransformOutput(
      this.dom,
      this.config.output.cssTransform
    )
  };

  public transformers = {
    tween: new TweenTransformer(
      this.dom,
      this.config.transformer.tween
    ),
    clamp: new ClampTransformer(
      this.dom,
      this.config.transformer.clamp
    )
  };
}
