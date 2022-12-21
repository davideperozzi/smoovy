import bypassFocus, { BypassFocusConfig } from './behaviors/bypassFocus';
import clampContent from './behaviors/clampContent';
import keyboard, { KeyboardConfig } from './behaviors/keyboard';
import lerpContent, { LerpContentConfig } from './behaviors/lerpContent';
import mouseWheel, { MouseWheelConfig } from './behaviors/mouseWheel';
import nativeScrollbar, {
  NativeScrollbarConfig,
} from './behaviors/nativeScrollbar';
import scrollTo from './behaviors/scrollTo';
import styleContainer, {
  StyleContainerConfig,
} from './behaviors/styleContainer';
import touchInertia, { TouchInertiaConfig } from './behaviors/touchInertia';
import translate, { TranslateConfig } from './behaviors/translate';
import { ScrollBehaviorItem, Scroller, ScrollerDomType } from './core';

export const smoothScroll = (
  dom: ScrollerDomType,
  config: {
    lerp?: LerpContentConfig,
    mouse?: MouseWheelConfig,
    touch?: TouchInertiaConfig,
    focus?: BypassFocusConfig,
    styles?: StyleContainerConfig['defaults'],
    keyboard?: KeyboardConfig,
    translate?: TranslateConfig,
    scrollbar?: NativeScrollbarConfig | boolean,
    behaviors?: { [name: string]: ScrollBehaviorItem },
  } = {},
) => new Scroller(dom, {
  clampContent: clampContent(),
  scrollTo: scrollTo(),
  bypassFocus: bypassFocus(config.focus),
  touchInertia: touchInertia(config.touch),
  lerpContent: lerpContent(config.lerp),
  mouseWheel: mouseWheel(config.mouse),
  translate: translate(config.translate),
  styleContainer: styleContainer({
    defaults: (config.scrollbar ? {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      ...config.styles
    } : config.styles)
  }),
  keyboard: keyboard(config.keyboard),
  ...(config.scrollbar ? {
    nativeScrollbar: nativeScrollbar({
      ...(typeof config.scrollbar === 'object' ? config.scrollbar : {})
    })
  } : {}),
  ...(config.behaviors || {})
});