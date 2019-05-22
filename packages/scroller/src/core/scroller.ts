import { Coordinate, objectDeepMerge } from '@smoovy/utils';
import { Ticker } from '@smoovy/ticker';

import { MouseScrollerInput } from '../inputs/mouse-input';
import { ClampTransformer } from '../transformers/clamp-transformer';
import { TweenTransformer } from '../transformers/tween-transformer';
import { ScrollerDom } from './dom';
import { ScrollerInput, ScrollerInputEvent } from './input';
import { ScrollerTransformer } from './transformer';

export interface ScrollerConfig {
  mobileEnabled: boolean;
  mobileBypass: boolean;
}

const defaultConfig: ScrollerConfig = {
  mobileEnabled: false,
  mobileBypass: false
};

export class Scroller {
  private dom: ScrollerDom;
  private config = defaultConfig;
  private scrollPosition: Coordinate = { x: 0, y: 0 };
  private virtualPosition: Coordinate = { x: 0, y: 0 };
  private inputs: ScrollerInput[] = [];
  private transformers: ScrollerTransformer[] = [];

  public constructor(
    private target: HTMLElement,
    config?: ScrollerConfig
  ) {
    if (config) {
      this.config = objectDeepMerge(this.config, config);
    }

    this.dom = new ScrollerDom(this.target);

    this.inputs.push(new MouseScrollerInput(this.dom));
    this.transformers.push(new ClampTransformer(this.dom));
    this.transformers.push(new TweenTransformer(this.dom));

    this.dom.create();
    this.attach();
  }

  private attach() {
    this.inputs.forEach((input) => {
      input.subscribe(event => this.handleInput(event));
      input.attach();
    });
  }

  private detach() {
    this.inputs.forEach((input) => {
      input.unsubscribeAll();
      input.detach();
    });
  }

  public destroy() {
    this.dom.destroy();
    this.detach();
  }

  private handleInput(event: ScrollerInputEvent) {
    this.virtualPosition.x -= event.delta.x;
    this.virtualPosition.y -= event.delta.y;

    for (let i = 0, len = this.transformers.length; i < len; i++) {
      this.transformers[i].transform(
        this.scrollPosition,
        this.virtualPosition,
        () => {
          this.dom.wrapper.style.transform = `
            translate3d(0, ${-this.scrollPosition.y}px, 0)
          `;
        }
      );
    }
  }
}
