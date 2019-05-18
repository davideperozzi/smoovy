import { Coordinate, objectDeepMerge } from '@smoovy/utils';

import { ScrollerInput, MouseScrollerInput } from './input';

export interface ScrollerConfig {
  mobileEnabled: boolean;
  mobileBypass: boolean;
}

const defaultConfig: ScrollerConfig = {
  mobileEnabled: false,
  mobileBypass: false
};

export class Scroller {
  private position: Coordinate = { x: 0, y: 0 };
  private config: ScrollerConfig = defaultConfig;
  private inputs: ScrollerInput[] = [];

  public constructor(
    private target: HTMLElement,
    config?: ScrollerConfig
  ) {
    if (config) {
      this.config = objectDeepMerge(this.config, config);
    }

    this.inputs.push(new MouseScrollerInput(this.target));

    this.attach();
  }

  private attach() {
    this.inputs.forEach((input) => {
      input.subscribe(event => {
        console.log('Input event: ', event);
      });

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
    this.detach();
  }
}
