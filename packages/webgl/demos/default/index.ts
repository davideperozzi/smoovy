import { WebGL } from '../../src';

const webgl = new WebGL();

function updateScroll() {
  webgl.scrollTo({ x: window.scrollX, y: window.scrollY });
}

window.addEventListener('scroll', updateScroll);
setTimeout(() => updateScroll());

webgl.plane({
  element: document.querySelector('#box') as HTMLElement
}, (plane) => {
  plane.uniform('color', [ 133, 7, 0 ]);
});

const image = webgl.image({
  source: 'https://i.imgur.com/fHyEMsl.jpg',
  element: document.querySelector('#test-attach') as HTMLElement,
});
