import { smoothScroll, ScrollerEvent, nativeSmoothScroll } from '../../src';
import { getElementOffset } from '@smoovy/utils';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll(element, {
  // scrollbar: true
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

const item = document.querySelector<HTMLElement>('#sec4 a ')!;

scroller.onScroll((pos) => {
  const offset = getElementOffset(item);
  const shift = (pos.y - offset.y + window.innerHeight * .5) * 0.2;

  item.style.transform = `translate3d(0, ${-shift}px, 0)`;
});

window.addEventListener('keypress', (event) => {
  if (event.key === 'g') {
    if (scroller.isLocked()) {
      scroller.unlock();
    } else {
      scroller.lock();
    }
  }

  scroller.scrollTo({ x: 0, y: 0 }, true);
});

