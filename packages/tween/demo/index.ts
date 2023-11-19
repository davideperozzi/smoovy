import { easings, tween } from '../src';

const targets = document.querySelectorAll<HTMLElement>('.anim');
const fromProps = { y: 0 };

// const tl = tween.timeline({ autoStart: false })
//   .to(targets[0], { y: 500 }, { duration: 1000, easing: easings.easeOutExpo })
//   .fromTo(targets[1], { y: 500 },  { y: 0 }, { duration: 1000, easing: easings.easeOutExpo })
//   .to(targets[2], { y: 500 }, { duration: 1000, easing: easings.easeOutExpo })
//   .to(targets[3], { y: 500 }, { duration: 1000, easing: easings.easeOutExpo });

// tl.seek(4000, true, true, true);

// setTimeout(() => {
//   tl.reset(1, true).start();
// }, 2000);

const tveen = tween.fromTo(
  targets[0],
  fromProps,
  { y: 0 },
  {
    duration: 2100,
    autoStart: false,
    initSeek: true,
    easing: easings.easeOutExpo
  }
);

setTimeout(() => {
  fromProps.y = 500;

  tveen.update().seek(0, true, true);

  setTimeout(() => {
    fromProps.y = 700;

    tveen.update().seek(0, true, true);
    tveen.start();

    setTimeout(() => {
      tween.to(
        targets[0],
        { y: 500 },
        {
          duration: 1000,
          easing: easings.easeOutExpo
        }
      );
    }, 800);
  }, 500);
}, 1000);

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
