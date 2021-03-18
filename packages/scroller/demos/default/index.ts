import { smoothScroll, ScrollerEvent, nativeSmoothScroll } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = nativeSmoothScroll(element);

setTimeout(() => {
  scroller.scrollTo({ y: 1500 }, true);
  setTimeout(() => scroller.lock());
  setTimeout(() => scroller.lock(), 100);

  setTimeout(() => {
    scroller.unlock();
    scroller.unlock();
  }, 1500);
}, 1500);

// scroller.on(ScrollerEvent.RECALC, () => {
//   console.log('recalc');
// });
