import { Scroller } from '../../src';

const target = document.querySelector('main') as HTMLElement;
const scroller = new Scroller(target, {
  output: {
    cssTransform: {
      sectionSelector: 'section'
    }
  },
  transformer: {
    tween: {
      duration: 1500
    }
  }
});

setTimeout(() => {
  scroller.scrollTo(
    { y: 500 },
    {
      transformer: {
        tween: {
          duration: undefined
        }
      }
    }
  );
}, 0);
