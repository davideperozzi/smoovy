import {
  ObservableController, Observable, observe,
} from '@smoovy/observer';
import { Coordinate } from '@smoovy/utils';

import { ParallaxControllerState } from '../state';
import { VectorParallaxItem, VectorParallaxItemConfig } from './vector';

export interface ElementParallaxItemConfig
  extends Omit<VectorParallaxItemConfig, 'state'> {
  precision?: number;
  padding?: Coordinate;
  culling?: boolean;
  translate?: boolean;
  mapShift?: (shift: Coordinate) => Coordinate;
}

export class ElementParallaxItem<
  C extends ElementParallaxItemConfig = ElementParallaxItemConfig
> extends VectorParallaxItem<C> {
  public static observer = new ObservableController();
  protected observable: Observable<HTMLElement>;

  public constructor(
    protected element: HTMLElement | Observable<HTMLElement>,
    config: Partial<C> = {}
  ) {
    super(config);

    const observable = ElementParallaxItem.observer.add(this.element);

    if ( ! (observable.target instanceof HTMLElement)) {
      throw new Error('Parallax element has to be of type HTMLElement');
    }

    this.observable = observable;
  }

  protected get precision() {
    return this.config.precision || 2;
  }

  protected onUpdate(state: ParallaxControllerState) {
    const culling = this.config.culling === false;
    const viewportState = culling
      ? { inside: true }
      : this.observable.prepos(
          {
            x: state.scrollPosX - this.shift.x,
            y: state.scrollPosY - this.shift.y
          },
          {
            width: state.viewportWidth,
            height: state.viewportHeight
          },
          this.config.padding
        );

    if (typeof this.config.mapShift === 'function') {
      this.shift = this.config.mapShift.call(this, this.shift);
    }

    if (viewportState.inside) {
      const element = this.observable.target;

      if (this.config.translate !== false) {
        element.style.transform = `
          translate3d(
            ${this.shift.x.toFixed(this.precision)}px,
            ${this.shift.y.toFixed(this.precision)}px,
            0
          )
        `;
      }
    }
  }

  protected getState() {
    return {
      x: this.observable.offset.x,
      y: this.observable.offset.y,
      width: this.observable.offset.width,
      height: this.observable.offset.height
    };
  }
}
