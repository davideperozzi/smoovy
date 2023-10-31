import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');

// let times = 0;
// const tveen = tween.to(targets[0], { y: 200 }, {
//   delay: 500,
//   duration: 500,
//   onStop: () => console.log('stopped'),
//   onReset: () => ++times
// });

// setTimeout(() => {
//   tveen.reset();

//   setTimeout(() => {
//     console.log('called times', times)
//   }, 300);
// }, 500);

// tween.staggerTo(
//   targets, {
//     y: 200,
//     rotate: 180
//   },
//   {
//     stagger: { offset: -0.5 }
//   }
// );


// const tveen = tween.fromTo(targets[0], { y: 0 }, { y: 500 }, {
//   duration: 100,
//   delay: 500,
//   onComplete: () => {
//     tveen.reverse().start();
//   }
// });

// interface Coordinate {
//   x: number;
//   y: number;
// }

// const stag = tween.staggerFromTo(targets, { rotate: 350 }, { rotate: 100 }, {
//   duration: 500,
//   stagger: { offset: 0.5 },
// });

// tween.fromTo(targets[0], { y: 50, opacity: 0 }, { y: 500 }, { delay: 1000, duration: 1000 });

// tween.to(target, { x: 100 });
// tween.fromTo(target, {  })
// tween.fromTo(targets[0], { x: 0, y: 0 }, { x: 0, y: 100 });
//

const timeline = tween.timeline({
  delay: 500,
  onComplete: () => console.log('completed')
});

const config = { duration: 10000, easing: easings.easeOutCirc }

timeline.add(tween.fromTo(targets[0], { y: 0 }, { y: 500 }, config));
timeline.add(tween.fromTo(targets[2], { y: 0 }, { y: 500 }, { duration: 3000 }), { offset: 0.5 });
timeline.add(tween.fromTo(targets[1], { y: 0 }, { y: 500 }, { duration: 4000 }), { offset: -1 });
timeline.add(tween.fromTo(targets[3], { y: 0 }, { y: 500 }, config), { offset: 0 });
// timeline.add(tween.fromTo(targets[4], { y: 0 }, { y: 500 }, config), { offset: -1 });


// timeline.add(
//   tween.fromTo(targets[1], { y: 500 }, { y: 0 }, { duration: 1500 }),
//   { offset: 0 }
// );

// timeline.add(
//   tween.fromTo(targets[2], { y: 500 }, { y: 0 }, { duration: 1500 }),
//   { offset: -.1 }
// );

// timeline.add([
//   tween.fromTo(targets[3], { y: 500 }, { y: 0 }),
//   tween.fromTo(targets[4], { y: 500 }, { y: 0 }, { delay: 500 }),
//   tween.fromTo(targets[5], { y: 0 }, { y: 500 }, { duration: 1500 }),
// ], { offset: 1.0 });


// timeline.add(
//   tween.fromTo(targets[3], { y: 500 }, { y: 0 }, { duration: 800 }),
//   { offset: -1 }
// );

// async function test() {
//   const tl = await tween.staggerTo(
//     targets,
//     { x: 100, rotate: 100 },
//     {
//       stagger: { offset: -0.3 },
//       timeline: { delay: 1000 },
//       easing: easings.easeInElastic
//     }
//   );

//   await tl.reverse().start();
// }

// test();


// for (const target of targets) {
  // await tween.fromTo(target, { opacity: 0.5 }, { duration: 500 });
  // await tween.to(target, { opacity: 1 }, { duration: 500 });

//   timeline.add(tween.to(target, {   }, {
//     duration: 500,
//     easing: easings.easeInOutCirc,
//     onStart: () => {
//       console.log('started');
//     },
//     onComplete: () => {
//       console.log('completed tween');
//     },
//   }), { offset: -0.5 });
// }

// timeline.start();

// document.querySelectorAll<HTMLElement>('.anim').forEach(el => {
//   const props = { scale: 1 };
//   const tveen = tween.to(props, { scale: 0.5 }, {
//     key: el,
//     dom: el,
//     duration: 500,
//     delay: 500,
//     autoStart: false,
//     // reversed: true,
//     easing: easings.easeOutExpo,
//     // onStop: () => console.log('stop'),
//     // onDelay: (ms, p) => console.log('delay', p),
//     onUpdate: ({ scale }, progress) => {
//       // console.log(scale, progress);
//       // el.style.transform = `scale(${scale})`;
//     },
//     onComplete: () => {
//       requestAnimationFrame(() => {
//         tveen.reverse().start();
//       })
//     }
//   });

//   el.addEventListener('click', () => tveen.start())
// })