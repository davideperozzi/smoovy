import { easings, Tween } from '@smoovy/tween';

import { ActionArgs, RouterTransition } from '../transition';

export class FadeTransition extends RouterTransition {
  private styles = { opacity: 1 };

  public async afterEnter() {}
  public async beforeLeave() {}

  public async beforeEnter({ root }: ActionArgs) {
    await new Promise((resolve) => {
      Tween.fromTo(this.styles, { opacity: 0 }, {
        duration: 500,
        easing: easings.Quad.out,
        on: {
          update: ({ opacity }) => root.style.opacity = `${opacity}`,
          complete: resolve
        }
      });
    });
  }

  public async afterLeave({ root }: ActionArgs) {
    await new Promise((resolve) => {
      Tween.fromTo(this.styles, { opacity: 1 }, {
        duration: 500,
        easing: easings.Quad.out,
        on: {
          update: ({ opacity }) => root.style.opacity = `${opacity}`,
          complete: resolve
        },
      });
    });
  }
}
