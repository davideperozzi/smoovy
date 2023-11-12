import { set, setNow } from './helper/setters';
import { staggerFromTo, staggerTo, timeline } from './helper/timeline';
import { delay, from, fromTo, noop, to } from './helper/tween';

export const tween = {
  to,
  fromTo,
  timeline,
  from,
  set,
  setNow,
  staggerTo,
  noop,
  delay,
  staggerFromTo
};