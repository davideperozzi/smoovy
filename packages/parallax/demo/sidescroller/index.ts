import { parallax, Parallax } from '../../src';

document.querySelectorAll<HTMLElement>('.image').forEach(element => {
  parallax({
    element,
    speed: { x: .1 },
    masking: true,
  });
});

const update = () => {
  Parallax.update({
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    maxWidth: document.body.offsetWidth,
    maxHeight: document.body.offsetHeight,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight
  });
}

window.addEventListener('scroll', () => update());
requestAnimationFrame(() => update());