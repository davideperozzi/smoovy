import { tween, easings } from "@smoovy/tween";
import { RouterAnimation, RouterEvent, RouterEventType } from "./router";

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
    element.style.display = '';
  },
  append: ({ toElement }) => {
    toElement.style.display = 'none';

    if (toElement.style.opacity === '') {
      toElement.style.opacity = '0';
    }
  },
  enter: ({ fromElement, toElement, fromInDom }) => {
    if (fromInDom && fromElement.style.display !== 'none') {
      return tween.to(fromElement, { opacity: 0 }, {
        duration: config.duration || 500,
        easing: config.easing
      });
    }
  },
  leave: ({ toElement, fromElement }) => {
    toElement.style.display = '';
    fromElement.style.display = 'none';

    return tween.to(toElement, { opacity: 1 }, {
      duration: config.duration || 500,
      easing: config.easing
    });
  },
} as RouterAnimation);