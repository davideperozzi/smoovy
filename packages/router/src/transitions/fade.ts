import { easings, tween } from '@smoovy/tween';

import { ActionArgs, RouterTransition } from '../transition';

export interface FadeTransitionConfig {
  duration: number;
  easing: easings.Easing;
}

export class FadeTransition extends RouterTransition {
  private styles = { opacity: 1 };
  private config: FadeTransitionConfig = {
    duration: 500,
    easing: easings.easeOutQuad
  };

  public constructor(config?: Partial<FadeTransitionConfig>) {
    super();

    if (config) {
      this.config = Object.assign(this.config, config);
    }
  }


  public async navStart() {}
  public async navEnd() {}

  public async afterEnter() {}
  public async beforeLeave() {}

  public async beforeEnter(config: ActionArgs) {
    await this.animate(config.root, 0);
  }

  public async afterLeave(config: ActionArgs) {
    await this.animate(config.root, 1);
  }

  private async animate(element: HTMLElement, toOpacity = 0) {
    await tween.to(element, { opacity: toOpacity }, {
      duration: this.config.duration,
      easing: this.config.easing
    });
  }
}
