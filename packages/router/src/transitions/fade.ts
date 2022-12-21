import { easings, tweenFromTo } from '@smoovy/tween';

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

  public async afterEnter() {}
  public async beforeLeave() {}

  public async beforeEnter(config: ActionArgs) {
    await this.animate(config.root, 0);
  }

  public async afterLeave(config: ActionArgs) {
    await this.animate(config.root, 1);
  }

  private animate(element: HTMLElement, toOpacity = 0) {
    return new Promise<void>(resolve => {
      tweenFromTo(
        this.styles,
        {
          opacity: toOpacity
        },
        {
          duration: this.config.duration,
          easing: this.config.easing,
          onUpdate: ({ opacity }) => {
            element.style.opacity = `${opacity}`;
          },
          onComplete: resolve
        }
      );
    });
  }
}
