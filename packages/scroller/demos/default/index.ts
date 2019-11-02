import { smoothScroll } from '../../src';
import { Browser } from '@smoovy/utils';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll({ element }, {
  styles: {
    height: '100vh'
  }
});
