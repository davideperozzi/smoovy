import {
  ElementObserver, elementObserverDefaultConfig, ElementState,
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
}

export class ElementParallaxItem<
  C extends ElementParallaxItemConfig = ElementParallaxItemConfig
> extends VectorParallaxItem<C> {
  public static observer = new ElementObserver(elementObserverDefaultConfig);
  protected elementState: ElementState;

  public constructor(
    protected element: HTMLElement | ElementState,
    config: Partial<C> = {}
  ) {
    super(config);

    this.elementState = ElementParallaxItem.observer.observe(this.element);
  }

  protected get precision() {
    return this.config.precision || 2;
  }

  protected onUpdate(state: ParallaxControllerState) {
    const culling = this.config.culling === false;
    const viewportState = culling
      ? { inside: true }
      : this.elementState.inViewport(
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

    if (viewportState.inside) {
      const element = this.elementState.element;

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
      x: this.elementState.offset.x,
      y: this.elementState.offset.y,
      width: this.elementState.size.width,
      height: this.elementState.size.height
    };
  }
}
