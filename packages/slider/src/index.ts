import { EventEmitter, listenCompose, listenEl, Unlisten } from '@smoovy/event';

export interface SliderConfig {
  autoplay?: false | number;
  loop?: boolean;
}

const defaultConfig = {
  loop: false,
  autoplay: false
};

export class Slider extends EventEmitter {
  private listener: Unlisten;
  protected config = defaultConfig;

  public constructor(
    protected container: HTMLElement,
    config: SliderConfig = {}
  ) {
    super();

    this.config = Object.assign(this.config, config);
  }

  public attach() {
    this.listener = listenCompose(
      listenEl(this.container, 'scroll', (event) => {
        event.preventDefault();

        this.container.scrollLeft = this.container.scrollTop = 0;
      }),
    );
  }

  public detach() {
    if (this.listener) {
      this.listener();
    }
  }
}
