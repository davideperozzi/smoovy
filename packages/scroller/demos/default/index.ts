import { smoothScroll } from '../../src';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScroll({ element }, {
  styles: {
    height: '100vh'
  }
});
