import {
  ClampTransformer, CssTransformOutput, MouseWheelInput,
  TouchSwipeInput
} from '@smoovy/scroller-shared';

import { Scroller, ScrollerModule, ScrollerTransformer } from '../../src';
import { Coordinate } from '@smoovy/utils';

class StaticTransformer extends ScrollerTransformer {
  private virtualPosition: Coordinate = { x: 0, y: 0 };

  public virtualTransform(position: Coordinate) {
    this.virtualPosition = position;
  }

  public outputTransform(
    position:  Coordinate,
    update: () => void,
    complete: () => void
  ) {
    position.x = this.virtualPosition.x;
    position.y = this.virtualPosition.y;

    update();
    complete();
  }
}

class MyScrollerModule extends ScrollerModule<any> {
  public inputs = {
    mouseWheel: new MouseWheelInput(
      this.dom,
      this.config.input.mouseWheel
    ),
    touchSwipe: new TouchSwipeInput(
      this.dom,
      this.config.input.touchSwipe
    )
  };

  public outputs = {
    cssTransform: new CssTransformOutput(
      this.dom,
      this.config.output.cssTransform
    )
  };

  public transformers = {
    clamp: new ClampTransformer(
      this.dom,
      this.config.transformer.clamp
    ),
    static: new StaticTransformer(
      this.dom
    )
  };
}

class MyScroller extends Scroller<MyScrollerModule> {
  protected get moduleCtor() {
    return MyScrollerModule;
  }
}

const target = document.querySelector('main') as HTMLElement;
const container = document.querySelector('.custom-container')  as HTMLElement;
const wrapper = document.querySelector('.custom-wrapper') as HTMLElement;
const scroller = new MyScroller(target, {
  dom: { container, wrapper },
  on: {
    input: (pos) => {
      console.log('input', pos);
    },
    output: (pos) => {
      console.log('output', pos);
    },
    recalc: (virtPos, outPos) => {
      console.log('recalc', virtPos, outPos);
    }
  }
});
