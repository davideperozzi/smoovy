import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');

// const timeline = tween.timeline({ delay: 500, autoStart: false });

// timeline.fromTo(targets[0], { y: 0 }, { y: 500 });
// timeline.fromTo(targets[0], { x: 0 }, { x: 500 }, { offset: -.3 });
// timeline.start();

// tween.fromTo(
//   targets[0],
//   { y: 100 },
//   { y: 300 },
//   { delay: 500, duration: 500, autoStart: false, initSeek: false }
// );

// timeline.add(tween.fromTo(
//   targets[0],
//   { y: 100 },
//   { y: 300 },
//   {
//     duration: 500,
//     // autoStart: false,
//     initSeek: false
//   }
// ));

// timeline.seek(750);

// setTimeout(() => {
//   // timeline.reset();
// }, 1000);

// requestAnimationFrame(() => {
//   timeline.reset();
// })

// tween.fromTo(targets[0], { y: 0 }, { y: 500 }, { delay: 500, duration: 2000 });

// setTimeout(() => {
//   tween.fromTo(targets[0], { y: 50 }, { y: 500 }, { duration: 2000, recover: true }).then(() => {
//     requestAnimationFrame(() => {
//       tween.fromTo(targets[0], { y: 0 }, { y: 500 });
//     })
//   })
// }, 1000)

