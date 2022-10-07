import { easings } from '@smoovy/tween';
import { getElementOffset } from '@smoovy/utils';

import { hypbridSmoothScroll, ScrollerEvent, smoothScroll } from '../../src';

const element = document.querySelector('main') as HTMLElement;
const scroller = hypbridSmoothScroll(element);

document.querySelectorAll('[data-scrollto]').forEach(el => {
  const toSel = el.getAttribute('data-scrollto');
  const toEl = document.querySelector(toSel!);
  const offset = getElementOffset(toEl as HTMLElement);

  el.addEventListener('click', (event) => {
    event.preventDefault();
  });
});

window.addEventListener('keypress', (event) => {
  if (event.key === 'g') {
    if (scroller.isLocked()) {
      scroller.unlock();
    } else {
      scroller.lock();
    }
  }

  if (event.key === 'd') {
    scroller.scrollTo({ x: 0, y: 0 }, true);
  }
});

