import { smoothScroll, ScrollerEvent, nativeSmoothScroll } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll(element, {
  scrollbar: true
});

window.addEventListener('keypress', (event) => {
  if (event.key === 'g') {
    if (scroller.isLocked()) {
      scroller.unlock();
    } else {
      scroller.lock();
    }
  }
});
