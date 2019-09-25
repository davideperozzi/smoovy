import { Scroller } from '../../src';

const target = document.querySelector('main') as HTMLElement;
const scroller = new Scroller(target, {
  input: {
    mouseWheel: {
      target: document.documentElement
    }
  },
  output: {
    cssTransform: {
      sectionSelector: 'section'
    }
  },
  transformer: {
    tween: {
      duration: 1500
    }
  },
  on: {
    recalc: (position) => {},
    output: (position) => {},
    input: (position) => {}
  }
});

setTimeout(() => {
  scroller.scrollTo(
    { y: 500 },
    {
      transformer: {
        tween: {
          duration: 10000
        }
      }
    }
  );
}, 0);
