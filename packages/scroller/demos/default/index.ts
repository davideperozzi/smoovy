import { smoothScroll, ScrollerEvent, nativeSmoothScroll } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = nativeSmoothScroll(element);

setTimeout(() => {
  scroller.scrollTo({ y: 1500 }, true);
}, 2000);

// scroller.on(ScrollerEvent.RECALC, () => {
//   console.log('recalc');
// });
