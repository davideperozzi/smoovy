import * as coreBehaviors from './behaviors';
import { ScrollBehavior, Scroller } from './core';
import { ScrollerDom, ScrollerDomConfig } from './dom';

export const smoothScroll = (
  dom: ScrollerDomConfig | ScrollerDom,
  config: {
    mouse?: coreBehaviors.MouseWheelConfig,
    touch?: coreBehaviors.TouchInertiaConfig,
    lerp?: coreBehaviors.LerpContentConfig,
    translate?: coreBehaviors.TranslateConfig,
    keyboard?: coreBehaviors.KeyboardConfig,
    focus?: coreBehaviors.BypassFocusConfig,
    styles?: coreBehaviors.StyleContainerConfig['defaults'],
    behaviors?: { [name: string]: ScrollBehavior }
  } = {},
) => new Scroller(dom, {
  clampContent: coreBehaviors.clampContent(),
  tweenTo: coreBehaviors.tweenTo(),
  scrollTo: coreBehaviors.scrollTo(),
  bypassFocus: coreBehaviors.bypassFocus(config.focus),
  styleContainer: coreBehaviors.styleContainer({ defaults: config.styles }),
  touchInertia: coreBehaviors.touchInertia(config.touch),
  lerpContent: coreBehaviors.lerpContent(config.lerp),
  mouseWheel: coreBehaviors.mouseWheel(config.mouse),
  translate: coreBehaviors.translate(config.translate),
  keyboard: coreBehaviors.keyboard(config.keyboard),
  ...(config.behaviors || {})
});
