import { smoothScroll, ScrollerEvent } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll(element, {
  styles: {
    height: '100vh'
  }
});

// scroller.on(ScrollerEvent.RECALC, () => {
//   console.log('recalc');
// });
