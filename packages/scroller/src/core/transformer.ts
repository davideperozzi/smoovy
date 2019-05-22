import { ScrollerDom } from './dom';
import { Coordinate } from '@smoovy/utils';

export abstract class ScrollerTransformer {
  public constructor(
    protected dom: ScrollerDom
  ) {}

  public abstract transform(
    scrollPos: Coordinate,
    virtualPos: Coordinate,
    update: () => void
  ): void;
}
