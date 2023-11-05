import { set, setNow } from './helper/setters';
import { staggerFromTo, staggerTo, timeline } from './helper/timeline';
import { from, fromTo, to } from './helper/tween';

export const tween = {
  to,
  fromTo,
  timeline,
  from,
  set,
  setNow,
  staggerTo,
  staggerFromTo
};