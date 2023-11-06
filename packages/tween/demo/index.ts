import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');

const timeline = tween.timeline({ delay: 500 });

timeline.to(targets[0], { y: 300 }, { duration: 500 });
timeline.to(targets[0], { x: 300 }, { duration: 500 });

// const tveen = tween.fromTo(targets[0], { y: 0 }, { y: 500 }, { delay: 500 });

// setTimeout(() => {
//   tween.fromTo(targets[0], { y: 0 }, { y: 500 }).then(() => {
//     requestAnimationFrame(() => {
//       tween.fromTo(targets[0], { y: 0 }, { y: 500 });
//     })
//   })
// }, 700)

