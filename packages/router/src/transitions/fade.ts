import { easings, Tween } from '@smoovy/tween';

import { ActionArgs, RouterTransition } from '../transition';
import { EasingImplementation } from 'tween/src/easing';

export interface FadeTransitionConfig {
  duration: number;
  easing: EasingImplementation;
}

export class FadeTransition extends RouterTransition {
  private styles = { opacity: 1 };
  private config: FadeTransitionConfig = {
    duration: 500,
    easing: easings.Quad.out
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
    return new Promise((resolve) => {
      Tween.fromTo(
        this.styles,
        {
          opacity: toOpacity
        },
        {
          duration: this.config.duration,
          easing: this.config.easing,
          on: {
            update: ({ opacity }) => {
              element.style.opacity = `${opacity}`;
            },
            complete: resolve
          },
        }
      );
    });
  }
}
