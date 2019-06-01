import { Scroller as CoreScroller } from '@smoovy/scroller-core';
import { ScrollerTweenModule } from '@smoovy/scroller-tween';

export class Scroller extends CoreScroller<ScrollerTweenModule> {
  public get moduleCtor() {
    return ScrollerTweenModule;
  }
}
