import {
  ObservableController, Observable, observe, ObservableConfig,
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
  observe?: boolean | ObservableConfig;
  contained?: HTMLElement;
  mapShift?: (shift: Coordinate, boundShift?: Coordinate) => Coordinate;
}

export class ElementParallaxItem<
  C extends ElementParallaxItemConfig = ElementParallaxItemConfig
> extends VectorParallaxItem<C> {
  public static observer = new ObservableController();

  protected boundShiftSum = 0;
  protected observable?: Observable<HTMLElement>;

  public constructor(
    protected element: HTMLElement,
    config: Partial<C> = {}
  ) {
    super(config);

    if (config.observe !== false) {
      this.observable = ElementParallaxItem.observer.add(this.element, {
        observeVisibility: true,
        observeResize: true,
        ...(typeof config.observe === 'object'
          ? config.observe as ObservableConfig
          : {}
        )
      });
    }

    if (this.config.contained) {

    }

    this.recalc();
  }

  public destroy() {
    super.destroy();

    if (this.observable) {
      ElementParallaxItem.observer.delete(this.observable);
    }
  }

  public recalc() {
    super.recalc();

    if (this.observable) {
      this.observable.update();
    }
  }

  protected get precision() {
    return this.config.precision || 2;
  }

  protected onUpdate(state: ParallaxControllerState) {
    const vpState = { inside: true };

    if (this.config.culling !== false && this.observable) {
      if (this.config.contained) {
        vpState.inside = this.observable.visibility;
      } else {
        const prepos = this.observable.prepos(
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

        vpState.inside = prepos.inside;
      }
    }

    if (typeof this.config.mapShift === 'function') {
      this.shift = this.config.mapShift.call(this, this.shift, this.boundShift);
    }

    if (vpState.inside) {
      const element = this.config.contained || this.element;

      if (
        this.config.contained &&
        this.boundShift.x + this.boundShift.y !== this.boundShiftSum
      ) {
        this.boundShiftSum = this.boundShift.x + this.boundShift.y;

        if (this.speed.y !== 0) {
          if (this.boundShift.y < 0) {
            element.style.top = `-${this.boundShift.y * -1}px`;
            element.style.bottom = `-${this.boundShift.y * -1}px`;
          } else {
            element.style.top = `-${this.boundShift.y * .5}px`;
            element.style.bottom = `-${this.boundShift.y * .5}px`;
          }
        }

        if (this.speed.x !== 0) {
          if (this.boundShift.x < 0) {
            element.style.left = `-${this.boundShift.x * -1}px`;
            element.style.right = `-${this.boundShift.x * -1}px`;
          } else {
            element.style.left = `-${this.boundShift.x * .5}px`;
            element.style.right = `-${this.boundShift.x * .5}px`;
          }
        }
      }

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
    return this.observable ? {
      x: this.observable.offset.x,
      y: this.observable.offset.y,
      width: this.observable.offset.width,
      height: this.observable.offset.height
    } : {
      x: this.element.offsetLeft,
      y: this.element.offsetTop,
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    };
  }
}
