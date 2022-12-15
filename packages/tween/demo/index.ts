import { tweenFromTo, easings } from '../src';


document.querySelectorAll<HTMLElement>('.anim').forEach(el => {
  const props = { scale: 1 };

  el.addEventListener('click', () => {
    tweenFromTo(props, { scale: props.scale < 1 ? 1 : 0.5 }, {
      key: el,
      duration: 1500,
      easing: easings.easeOutExpo,
      onStop: () => console.log('stop'),
      onUpdate: ({ scale }, progress) => {
        console.log(scale, progress);
        el.style.transform = `scale(${scale})`;
      }
    });
  })
})