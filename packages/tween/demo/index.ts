import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');
const timeline = tween.timeline({
  delay: 1000,
  // autoStart: false,
  // onStart: () => console.log('start'),
  // onDelay: () => console.log('delay'),
  // onSeek: (ms, progress) => console.log('seek', ms),
  // onComplete: () => console.log('complete')
});

tween.to({ y: 0 }, { y: 500 }, { onStart: () => console.log('start') });

// timeline.add(tween.to(targets[0], { y: 500 }, { duration: 3000 }));
// timeline.add(() => {
//   return tween.to(targets[1], { y: 500 });
// }, { offset: -1 });
// timeline.add(tween.to(targets[2], { y: 500 }), { offset: 0 });
// timeline.add(() => tween.timeline().add(
//   () => tween.timeline()
//     .add(() => tween.to(targets[3], { y: 500 }))
//     .add(tween.to(targets[4], { y: 500 }))
//     .add(() => tween.timeline().add(tween.to(targets[5], { y: 500 })))
// ), { offset: 0 });

// console.log(timeline.duration);
// timeline.start().then(() => console.log(timeline.duration))
// console.log(timeline.duration);
// timeline.seek(timeline.duration);
// timeline.add(tween.to(targets[5], { y: 500 }, { duration: 1500 }), { offset: -1 });

// console.log(timeline.duration);

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
