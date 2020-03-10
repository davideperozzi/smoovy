import { Browser } from '@smoovy/utils';

import * as coreBehaviors from './behaviors';
import { ScrollBehaviorItem, Scroller, ScrollerDomType } from './core';

export const smoothScroll = (
  dom: ScrollerDomType,
  config: {
    lerp?: coreBehaviors.LerpContentConfig,
    mouse?: coreBehaviors.MouseWheelConfig,
    touch?: coreBehaviors.TouchInertiaConfig,
    focus?: coreBehaviors.BypassFocusConfig,
    styles?: coreBehaviors.StyleContainerConfig['defaults'],
    keyboard?: coreBehaviors.KeyboardConfig,
    translate?: coreBehaviors.TranslateConfig,
    behaviors?: { [name: string]: ScrollBehaviorItem }
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

export const nativeSmoothScroll = (
  dom: ScrollerDomType,
  config: {
    lerp?: coreBehaviors.LerpContentConfig,
    focus?: coreBehaviors.BypassFocusConfig,
    styles?: coreBehaviors.StyleContainerConfig['defaults'],
    scrollTo?: coreBehaviors.ScrollToConfig,
    tweenTo?: coreBehaviors.TweenToConfig,
    translate?: coreBehaviors.TranslateConfig,
    native?: coreBehaviors.BypassNativeConfig,
    scrollbar?: coreBehaviors.NativeScrollbarConfig,
    behaviors?: { [name: string]: ScrollBehaviorItem }
  } = {}
) => new Scroller(dom, {
  clampContent: coreBehaviors.clampContent(),
  nativeScrollbar: coreBehaviors.nativeScrollbar(config.scrollbar),
  lerpContent: coreBehaviors.lerpContent(config.lerp),
  bypassNative: coreBehaviors.bypassNative({
    condition: () => Browser.mobile,
    ...config.native
  }),
  translate: coreBehaviors.translate(config.translate),
  tweenTo: coreBehaviors.tweenTo({
    nativeTarget: Browser.client ? window : undefined,
    ...config.tweenTo
  }),
  scrollTo: coreBehaviors.scrollTo({
    nativeTarget: Browser.client ? window : undefined,
    ...config.scrollTo
  }),
  bypassFocus: coreBehaviors.bypassFocus({
    nativeTarget: Browser.client ? window : undefined,
    ...config.focus
  }),
  styleContainer: coreBehaviors.styleContainer({
    defaults: {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      ...config.styles
    }
  }),
  ...(config.behaviors || {})
});
