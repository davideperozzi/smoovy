import { queryEl } from '@smoovy/utils';
import { Parallax, parallax } from '../src';

parallax({
  speed: { y: 0.3 },
  element: {
    target: queryEl('.box0'),
  },
});

parallax({
  speed: { y: 0.1 },
  element: queryEl('.box1'),
  onUpdate: (state, progress) => {
    const styles = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)
    `;

    queryEl('.box1').innerHTML = `<div style="${styles}">
      ${(progress.y * 100).toFixed(2)}%
    </div>`;
  }
});

parallax({
  speed: { x: 0, y: .1 },
  element: queryEl('.image-box .image-wrapper'),
  masking: true
});

parallax({
  speed: { y: 1.5 },
  culling: false,
  element: queryEl('.box2'),
});

parallax({
  speed: { y: -0.3 },
  element: {
    target: queryEl('.box2-2'),
  }
});

parallax({
  element: queryEl('footer'),
  speed: { y: 0.4 }
});

parallax({
  speed: { y: 0.5 },
  element: queryEl('.box3'),
  onUpdate(state) {
    state.shiftX = state.shiftY;
    state.shiftY = 0;
  },
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

// function animate() {
//   update();
//   requestAnimationFrame(() => {
//     animate();
//   });
// }
// requestAnimationFrame(() => {
//   animate();
// });