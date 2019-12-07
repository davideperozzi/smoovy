import { smoothScroll } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll({ element }, {
  styles: {
    height: '100vh'
  }
});
