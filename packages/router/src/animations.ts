import { tween, easings } from "@smoovy/tween";
import { RouterAnimation, RouterEvent } from "./router";

export interface RouterFadeAnimationConfig {
  name?: string;
  when?: (event: RouterEvent) => boolean;
  duration?: number;
  easing?: easings.Easing;
}

export const fade = (config: RouterFadeAnimationConfig = {}) => ({
  name: config.name || 'smoovy:fade',
  when: config.when,
  release: (element) => {
    element.style.opacity = '';
  },
  beforeEnter: ({ fromElement, fromInDom }) => {
    if (fromInDom) {
      return tween.fromTo(fromElement, { opacity: 1 }, { opacity: 0 }, {
        recover: true,
        duration: config.duration || 500,
        easing: config.easing
      })
    }
  },
  leave: ({ toElement }) => {
    return tween.fromTo(toElement, { opacity: 0 }, { opacity: 1 }, {
      recover: true,
      duration: config.duration || 500,
      easing: config.easing
    })
  }
} as RouterAnimation);