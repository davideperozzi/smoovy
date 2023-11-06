import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');

const tveen = tween.to(
  { x: 0 },
  { x: 100 },
  {
    delay: 100,
    autoStart: false,
    duration: 100,
    onStart: () => console.log('start'),
    onPause: () => console.log('pause')
  }
);

setTimeout(() => {
  tveen.start();
  tveen.start();
  tveen.start();
  tveen.start();

  setTimeout(() => {
    tveen.pause();
    tveen.pause();
    tveen.pause();
    tveen.pause();

    // expect(startFn).toBeCalledTimes(1);
    // expect(pauseFn).toBeCalledTimes(1);
    // resolve();
  }, 10);
}, 10);

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

