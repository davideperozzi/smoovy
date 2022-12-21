import { queryEl } from '@smoovy/utils';
import { Parallax, parallax } from '../src';

// parallax({
//   speed: 0.3,
//   element: {
//     target: queryEl('.box0'),
//   }
// });
// parallax({
//   speed: -0.1,
//   element: queryEl('.box1'),
//   onUpdate: (state, progress) => {
//     queryEl('.box1').textContent = `${(progress.y * 100).toFixed(2)}%`;
//   }
// });
parallax({ speed: { x: 0, y: -0.3 }, element: {
  target: queryEl('.image-box .image-wrapper'),
  masking: true
}});
// parallax({ speed: 1.5, element: queryEl('.box2') });
// parallax({
//   speed: { y: -0.3 },
//   element: {
//     target: queryEl('.box2-2'),
//     // culling: false
//   }
// });
// parallax({ speed: 0.7, element: queryEl('footer') });
// parallax({
//   speed: 0.5,
//   element: queryEl('.box3'),
//   onUpdate(state) {
//     state.shiftX = state.shiftY;
//     state.shiftY = 0;
//   },
// });

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