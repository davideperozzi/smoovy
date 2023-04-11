import { Browser } from '@smoovy/utils';

import bypassNative, { BypassNativeConfig } from './behaviors/bypassNative';
import clampContent, { ClampContentConfig } from './behaviors/clampContent';
import lerpContent, { LerpContentConfig } from './behaviors/lerpContent';
import mouseWheel from './behaviors/mouseWheel';
import scrollContent from './behaviors/scrollContent';
import scrollTo, { ScrollToConfig } from './behaviors/scrollTo';
import { ScrollBehaviorItem, Scroller, ScrollerDomType } from './core';

export const hybridSmoothScroll = (
  dom: ScrollerDomType,
  config: {
    lerp?: LerpContentConfig,
    scrollTo?: ScrollToConfig,
    native?: BypassNativeConfig,
    clamp?: ClampContentConfig,
    behaviors?: { [name: string]: ScrollBehaviorItem },
  } = {}
) => new Scroller(dom, {
  lerpContent: lerpContent(config.lerp),
  mouseWheel: mouseWheel(),
  scrollContent: scrollContent(),
  scrollTo: scrollTo({
    nativeTarget: Browser.client ? window : undefined,
    ...config.scrollTo
  }),
  bypassNative: bypassNative({
    condition: () => Browser.mobile,
    ...config.native
  }),
  clampContent: clampContent({
    container: Browser.client ? window : undefined,
    ...(config.clamp || {})
  }),
  ...(config.behaviors || {})
});
