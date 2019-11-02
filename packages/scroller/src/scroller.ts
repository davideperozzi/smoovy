import * as behaviors from './behaviors';
import { Scroller } from './core';
import { ScrollerDomConfig } from './dom';

export const smoothScroll = (
  dom: ScrollerDomConfig,
  config: {
    mouse?: behaviors.MouseWheelConfig,
    touch?: behaviors.TouchInertiaConfig,
    lerp?: behaviors.LerpContentConfig,
    translate?: behaviors.TranslateConfig,
    keyboard?: behaviors.KeyboardConfig,
    styles?: behaviors.StyleContainerConfig['defaults'],
    native?: behaviors.BypassNativeConfig
  } = {}
) => new Scroller(dom, {
  clampContent: behaviors.clampContent(),
  bypassFocus: behaviors.bypassFocus(),
  tweenTo: behaviors.tweenTo(),
  scrollTo: behaviors.scrollTo(),
  bypassNative: behaviors.bypassNative(config.native),
  styleContainer: behaviors.styleContainer({ defaults: config.styles }),
  touchInertia: behaviors.touchInertia(config.touch),
  lerpContent: behaviors.lerpContent(config.lerp),
  mouseWheel: behaviors.mouseWheel(config.mouse),
  translate: behaviors.translate(config.translate),
  keyboard: behaviors.keyboard(config.keyboard),
});
