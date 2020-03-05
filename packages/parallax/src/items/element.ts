import {
  ElementObserver, elementObserverDefaultConfig, ElementState,
} from '@smoovy/observer';

import { ParallaxControllerState } from '../state';
import { VectorParallaxItem, VectorParallaxItemConfig } from './vector';

export interface ElementParallaxItemConfig
  extends Omit<VectorParallaxItemConfig, 'state'> {

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

  protected onUpdate(state: ParallaxControllerState) {
    const viewportState = this.elementState.inViewport(
      {
        x: state.scrollPosX - this.position.x,
        y: state.scrollPosY - this.position.y
      },
      {
        width: state.viewportWidth,
        height: state.viewportHeight
      }
    );

    if (viewportState.inside) {
      const element = this.elementState.element;
      const translate3d = `${this.position.x}px, ${this.position.y}px, 0`;

      element.style.transform = `translate3d(${translate3d})`;
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
