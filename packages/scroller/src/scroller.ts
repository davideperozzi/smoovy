import * as behaviors from './behaviors';
import { Scroller } from './core';
import { ScrollerDomConfig } from './dom';

export const smoothScrolling = (
  dom: ScrollerDomConfig,
  config: {
    lerp?: behaviors.LerpContentConfig,
    wheel?: behaviors.MouseWheelConfig,
    move?: behaviors.MoveContentConfig,
    keyboard?: behaviors.KeyboardConfig
  } = {}
) => new Scroller(dom, [
  behaviors.clampContent(),
  behaviors.containerScroll(),
  behaviors.lerpContent(config.lerp),
  behaviors.mouseWheel(config.wheel),
  behaviors.moveContent(config.move),
  behaviors.keyboard(config.keyboard)
]);
