import { Grid, imageGrid } from '../src';
import { Scroller } from '../../scroller/src';
import mouseWheel from '../../scroller/src/behaviors/mouseWheel';
import touchInertia from '../../scroller/src/behaviors/touchInertia';
import lerpContent from '../../scroller/src/behaviors/lerpContent';

const root = document.querySelector<HTMLElement>('main')!;
const data = [
  { width: 300, height: 350, image: `https://source.unsplash.com/random/${300}x${350}` },
  { width: 300, height: 400, image: `https://source.unsplash.com/random/${300}x${400}` },
  { width: 100, height: 100, image: `https://source.unsplash.com/random/${100}x${100}` },
  { width: 1920, height: 1080, image: `https://source.unsplash.com/random/${1920}x${1080}` }
];

// let first = false;
const grid = imageGrid({
  view: { width: window.innerWidth, height: window.innerHeight },
  size: 6,
  root,
  data,
  onExpand: (item, image) => {
    const scale = `${0.3  + Math.random() * 0.7}`;

    image.style.position = 'absolute';
    image.style.top = '50%';
    image.style.left = '50%';
    image.style.transform = `translate3d(-50%, -50%, 0) scale(${scale})`;

    return true;
  },
  map: (item) => {
    item.y = item.x + item.y;

    return item;
  }
});

/** Controls */
const element = { container: document.documentElement, wrapper: root };
const scroller = new Scroller({ element }, {
  touch: touchInertia({ enableMouseEvents: true }),
  mouse: mouseWheel(),
  lerp: lerpContent()
});

scroller.onScroll(pos => grid.translate(pos));


