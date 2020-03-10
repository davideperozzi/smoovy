import { easings } from '@smoovy/tween';
import { getElementOffset } from '@smoovy/utils';

import { nativeSmoothScroll } from '../../src';

const element = document.querySelector('main') as HTMLElement;
const scroller = nativeSmoothScroll(element);

document.querySelectorAll('[data-scrollto]').forEach(el => {
  const toSel = el.getAttribute('data-scrollto');
  const toEl = document.querySelector(toSel);
  const offset = getElementOffset(toEl as HTMLElement);

  el.addEventListener('click', (event) => {
    event.preventDefault();
    scroller.tweenTo(offset, { duration: 1500 });
  });
});
