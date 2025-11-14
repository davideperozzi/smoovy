import { Tween, easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');
const fromProps = { y: 0 };

const enter = tween.staggerFromTo(targets, { opacity: 0 }, { opacity: 1 }, {
  initSeek: true,
  delay: 1000,
  stagger: { offset: .1 },
  autoStart: false,
  onSeek: (ms) => console.log('seek', ms)
});

// enter.seek(enter.duration*.5);
//
// const tl = tween.timeline({ autoStart: false })
//   .add(enter);
//
//
// setTimeout(() => {
//   tl.start();
// }, 1500);


// tween.to(targets[0], { scaleY: .5 }, { duration: 1500 });
// tween.fromTo(targets[0], { y: 0, rotate: 30 }, { y: 300, rotate: 360 }, { duration: 1500, overwrite: false });
// tween.to(targets[0], { scaleX: .1 }, { duration: 3500, overwrite: false });


// const values1 = { x: 0 };
// const values2 = { x: 0 };
//
// const tl = tween.timeline({ autoStart: false }).add([
//   tween.to(values1, { x: 100 }, {
//     onUpdate: ({ x }) => { console.log('1', x) }
//   }),
//   tween.to(values2, { x: 100 }, {
//     onUpdate: ({ x }) => { console.log('2', x) }
//   }),
// ]);
//
// values1.x = 90;
// // values2.x = 90;
//
// tl.items.forEach(({ controller }) => {
//   if (controller instanceof Tween) {
//     controller.update();
//   }
// });
//
// tl.start();

// const tl = tween.timeline({
//   onStart: () => console.log('start 1'),
//   onComplete: () => console.log('complete')
// })
//   .add(tween.delay(1000))
//   .add(() => {
//     return tween.timeline({
//       onStart: () => console.log('start 2'),
//       onComplete: () => console.log('complete 2')
//     })
//       .to(targets[0], { y: 500 }, { duration: 1000, easing: easings.easeOutExpo})
//       .fromTo(targets[1], { y: 500 }, { y: 0 }, { duration: 1000, easing: easings.easeOutExpo })
//       .to(targets[2], { y: 500 }, { duration: 1000, easing: easings.easeOutExpo, onStart: () => console.log('start 3') })
//       .to(targets[3], { y: 500 }, { duration: 1000, easing: easings.easeOutExpo });
//   })


// const tveen = tween.fromTo(
//   targets[0],
//   fromProps,
//   { y: 500 },
//   {
//     duration: 2100,
//     easing: easings.easeOutExpo,
//     onComplete: () => console.log('onComplete'),
//     onStart: () => console.log('onStart'),
//   }
// );

// setTimeout(() => {
//   tveen.pause();

//   setTimeout(() => {
//     tveen.resume();
//   }, 500);
// }, 500)



// setTimeout(() => {
//   fromProps.y = 500;

//   tveen.update().seek(0, true, true);

//   setTimeout(() => {
//     fromProps.y = 700;

//     tveen.update().seek(0, true, true);
//     tveen.start();

//     // setTimeout(() => {
//     //   tween.to(
//     //     targets[0],
//     //     { y: 500 },
//     //     {
//     //       duration: 1000,
//     //       easing: easings.easeOutExpo
//     //     }
//     //   );
//     // }, 800);
//   }, 500);
// }, 1000);

// tveen.start();



// const element = document.querySelector<HTMLElement>('.vectors')!;
// element.innerHTML = '';
// element.style.height = vectors.length * 60 + 'px';
// element.style.position = 'relative';

// vectors.forEach((vector, i) => {
//   const [rightEdge, length] = vector;
//   const element = document.createElement('div');


//   element.style.position = 'absolute';
//   element.style.left = ((rightEdge - length)*.5) + 'px';
//   element.style.width = (length*.5) + 'px';
//   element.style.top = (i * 55) + 'px';
//   element.style.height = '50px';
//   element.style.background = 'gray';
//   element.innerHTML = `Duration ${length}ms | Start ${rightEdge-length}ms`;

//   document.querySelector('.vectors')!.appendChild(element);
// })