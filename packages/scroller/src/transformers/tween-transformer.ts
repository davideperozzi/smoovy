import { easings, Tween } from '@smoovy/tween';
import { Coordinate } from '@smoovy/utils';

import {
  ScrollerTransformer, ScrollerTransformerConfig,
} from '../core/transformer';

export interface TweenTransformerConfig extends ScrollerTransformerConfig {
  duration: number;
  easing: easings.EasingImplementation;
}

export class TweenTransformer<
  C extends TweenTransformerConfig = TweenTransformerConfig
> extends ScrollerTransformer<C> {
  private virtualPosition: Coordinate = { x: 0, y: 0 };

  public get defaultConfig() {
    return {
      duration: 1000,
      easing: easings.Expo.out
    } as C;
  }

  public recalc() {}

  public virtualTransform(position: Coordinate) {
    this.virtualPosition = position;
  }

  public outputTransform(
    position: Coordinate,
    update: () => void
  ) {
    Tween.fromTo(
      position,
      this.virtualPosition,
      {
        duration: this.config.duration,
        easing: this.config.easing,
        update: () => update()
      }
    );
  }
}
