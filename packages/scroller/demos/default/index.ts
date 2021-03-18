import { smoothScroll, ScrollerEvent } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll(element);

setTimeout(() => {
  scroller.scrollTo({ y: 1500 }, true);
  // scroller.scrollTo({ y: 1500 });
}, 2000);

// scroller.on(ScrollerEvent.RECALC, () => {
//   console.log('recalc');
// });
