import { observe } from '../../src';

const box1 = observe(document.querySelector('.box1') as HTMLElement);
const box2 = observe(document.querySelector('.box2') as HTMLElement);
const box3 = observe(document.querySelector('.box3') as HTMLElement);
const viewport = observe(window);

box1.onUpdate((state) => console.log('box1 updated', state));
viewport.onUpdate((state) => console.log('viewport updated', state));

let visibility = 0;

window.onscroll = () => {
  const scroll = { x: window.scrollX, y: window.scrollY };
  const prepos1 = box2.prepos(scroll, viewport.bounds);
  const prepos2 = box3.prepos(scroll, viewport.bounds);

  if ((visibility & 1) === 0 && prepos1.inside) {
    console.log('Box 2 visible');
  }

  if ((visibility & 2) === 0 && prepos2.inside) {
    console.log('Box 3 visible');
  }

  if (prepos1.inside) {
    visibility |= 1;
  } else {
    visibility &= ~1;
  }

  if (prepos2.inside) {
    visibility |= 2;
  } else {
    visibility &= ~2;
  }
};
