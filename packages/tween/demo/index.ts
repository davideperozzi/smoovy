import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');
// const timeline = tween.timeline({ delay: 500, autoStart: false });

// timeline.add(
//   tween.staggerFromTo(targets, { y: 0 }, { y: 120 }, {
//     duration: 1200,
//     units: { y: '%' },
//     easing: easings.easeOutExpo,
//     initSeek: false,
//     autoStart: false,
//     stagger: {
//       offset: 0.2
//     }
//   }),
// );

const timeline = tween.staggerFromTo(targets, { y: 0 }, { y: 120 }, {
  duration: 1200,
  units: { y: '%' },
  easing: easings.easeOutExpo,
  initSeek: false,
  autoStart: false,
  timeline: {
    delay: 500,
    autoStart: false,
  },
  stagger: {
    offset: 0.2
  }
});

// timeline.seek(3949349349);
// timeline.seek(3949349349, true);
// timeline.start();

// timeline.start();

// setTimeout(() => {
//   timeline.stop().start();
// }, 750)

// setTimeout(() => {
//   timeline.stop();
// }, 800)

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

