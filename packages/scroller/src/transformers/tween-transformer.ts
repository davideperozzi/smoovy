import { Coordinate } from '@smoovy/utils';
import { Tween, easings } from '@smoovy/tween';

import { ScrollerTransformer } from '../core/transformer';

export class TweenTransformer extends ScrollerTransformer {
  public transform(
    scrollPos: Coordinate,
    virtualPos: Coordinate,
    update: () => void
  ) {
    Tween.fromTo(
      scrollPos,
      virtualPos,
      {
        duration: 1000,
        easing: easings.Expo.out,
        update: () => update()
      }
    );
  }
}
