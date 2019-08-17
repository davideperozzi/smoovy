import {
  ScrollerTransformer, ScrollerTransformerConfig,
  ScrollerTransformerConfigOverride,
} from '@smoovy/scroller-core';
import { easings, Tween } from '@smoovy/tween';
import { Coordinate } from '@smoovy/utils';

export interface TweenTransformerConfig extends ScrollerTransformerConfig {
  duration: number;
  easing: easings.EasingImplementation;
}

export interface TweenTransformerConfigOverride
  extends ScrollerTransformerConfigOverride,
          TweenTransformerConfig {}

export class TweenTransformer<
  C extends TweenTransformerConfig = TweenTransformerConfig,
  O extends TweenTransformerConfigOverride = TweenTransformerConfigOverride
> extends ScrollerTransformer<C, O> {
  private virtualPosition: Coordinate = { x: 0, y: 0 };

  public get defaultConfig() {
    return {
      duration: 1000,
      easing: easings.Expo.out
    } as C;
  }

  public virtualTransform(position: Coordinate) {
    this.virtualPosition = position;
  }

  public outputTransform(
    position: Coordinate,
    update: () => void,
    complete: () => void
  ) {
    Tween.fromTo(
      position,
      this.virtualPosition,
      {
        duration: this.config.duration,
        easing: this.config.easing,
        on: {
          update: () => update(),
          stop: () => complete(),
          complete: () => complete()
        }
      }
    );
  }
}
