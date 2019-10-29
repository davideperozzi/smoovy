import {
  clampContent, lerpContent, LerpContentConfig, mouseWheel, MouseWheelConfig,
  moveContent, MoveContentConfig, keyboard, KeyboardConfig
} from './behaviors';
import { Scroller } from './core';
import { ScrollerDomConfig } from './dom';

export const smoothScrolling = (
  dom: ScrollerDomConfig,
  config: {
    lerp?: LerpContentConfig,
    wheel?: MouseWheelConfig,
    move?: MoveContentConfig,
    keyboard?: KeyboardConfig
  } = {}
) => new Scroller(dom, [
  clampContent(),
  lerpContent(config.lerp),
  mouseWheel(config.wheel),
  moveContent(config.move),
  keyboard(config.keyboard)
]);
