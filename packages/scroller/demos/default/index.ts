import {
  clampContent, lerpContent, mouseWheel, moveContent, Scroller,
} from '../../src';

const element = document.querySelector('main') as HTMLElement;
const scroller = new Scroller(
  { element },
  [
    mouseWheel(),
    lerpContent(),
    moveContent(),
    clampContent()
  ]
);
