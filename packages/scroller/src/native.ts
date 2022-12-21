import { Browser } from '@smoovy/utils';

import bypassFocus, { BypassFocusConfig } from './behaviors/bypassFocus';
import bypassNative, { BypassNativeConfig } from './behaviors/bypassNative';
import clampContent from './behaviors/clampContent';
import lerpContent, { LerpContentConfig } from './behaviors/lerpContent';
import nativeScrollbar, {
  NativeScrollbarConfig,
} from './behaviors/nativeScrollbar';
import scrollTo, { ScrollToConfig } from './behaviors/scrollTo';
import styleContainer, {
  StyleContainerConfig,
} from './behaviors/styleContainer';
import translate, { TranslateConfig } from './behaviors/translate';
import { ScrollBehaviorItem, Scroller, ScrollerDomType } from './core';

export const nativeSmoothScroll = (
  dom: ScrollerDomType,
  config: {
    lerp?: LerpContentConfig,
    focus?: BypassFocusConfig,
    styles?: StyleContainerConfig['defaults'],
    scrollTo?: ScrollToConfig,
    translate?: TranslateConfig,
    native?: BypassNativeConfig,
    scrollbar?: NativeScrollbarConfig,
    behaviors?: { [name: string]: ScrollBehaviorItem },
  } = {}
) => new Scroller(dom, {
  clampContent: clampContent(),
  lerpContent: lerpContent(config.lerp),
  translate: translate(config.translate),
  bypassNative: bypassNative({
    condition: () => Browser.mobile,
    ...config.native
  }),
  nativeScrollbar: nativeScrollbar({
    nativeHandler: true,
    ...config.scrollbar
  }),
  scrollTo: scrollTo({
    nativeTarget: Browser.client ? window : undefined,
    ...config.scrollTo
  }),
  bypassFocus: bypassFocus({
    nativeTarget: Browser.client ? window : undefined,
    ...config.focus
  }),
  styleContainer: styleContainer({
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