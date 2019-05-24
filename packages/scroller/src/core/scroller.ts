import { Coordinate, objectDeepMerge, Browser } from '@smoovy/utils';

import { ScrollerDom } from './dom';
import { ScrollerModule, ScrollerModuleConfig } from './module';
import { DefaultModule } from './modules/default-module';

export interface ScrollerConfig<
  C extends ScrollerModuleConfig = any,
  M = any
> extends ScrollerModuleConfig<
  C['input'],
  C['output'],
  C['transformer']
> {
  module: M;
  observeDom: boolean;
}

const defaultConfig: ScrollerConfig = {
  module: DefaultModule,
  observeDom: Browser.mutationObserver,
  transformer: {},
  input: {},
  output: {}
};

export class Scroller<M extends ScrollerModule = DefaultModule> {
  private dom: ScrollerDom;
  private config = defaultConfig;
  private outputPosition: Coordinate = { x: 0, y: 0 };
  private virtualPosition: Coordinate = { x: 0, y: 0 };
  public module: ScrollerModule;

  public constructor(
    private target: HTMLElement,
    config?: Partial<ScrollerConfig<M['config']>>
  ) {
    if (config) {
      this.config = objectDeepMerge(this.config, config);
    }

    this.dom = new ScrollerDom(this.target, this.config.observeDom);
    this.module = new this.config.module(
      this.dom,
      {
        input: this.config.input,
        output: this.config.output,
        transformer: this.config.transformer
      }
    );

    this.dom.create();
    this.module.init();

    this.attach();
  }

  private attach() {
    this.module.attach(
      this.virtualPosition,
      this.outputPosition
    );
  }

  private detach() {
    this.module.detach();
  }

  public destroy() {
    this.dom.destroy();
    this.detach();
  }
}
