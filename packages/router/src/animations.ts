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
  navStart: ({ fromElement }) => tween.to(
    fromElement,
    { opacity: 0 },
    {
      duration: config.duration || 500,
      easing: config.easing
    }
  ),
  beforeEnter: ({ toElement }) => tween.set(toElement, { opacity: 0 }),
  afterLeave: ({ toElement }) => tween.to(
    toElement,
    { opacity: 1 },
    {
      duration: config.duration || 500,
      easing: config.easing
    }
  ),
  afterRelease: (element) => {
    element.style.opacity = '';
  }
} as RouterAnimation);