import { MouseScrollerInput } from '../../inputs/mouse-input';
import { CssTransformOutput } from '../../outputs/css-transform-output';
import { ClampTransformer } from '../../transformers/clamp-transformer';
import { TweenTransformer } from '../../transformers/tween-transformer';
import { ScrollerModule } from '../module';

interface DefaultModuleConfig {
  input: {
    mouse: Partial<MouseScrollerInput['config']>
  };
  output: {
    cssTransform: Partial<CssTransformOutput['config']>
  };
  transformer: {
    tween: Partial<TweenTransformer['config']>
    clamp: Partial<ClampTransformer['config']>
  };
}

export class DefaultModule extends ScrollerModule<DefaultModuleConfig> {
  public inputs = [
    new MouseScrollerInput(this.dom, this.config.input.mouse)
  ];

  public outputs = [
    new CssTransformOutput(this.dom, this.config.output.cssTransform)
  ];

  public transformers = [
    new TweenTransformer(this.dom, this.config.transformer.tween),
    new ClampTransformer(this.dom, this.config.transformer.clamp)
  ];
}
