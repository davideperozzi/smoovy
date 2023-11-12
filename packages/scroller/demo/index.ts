import * as dat from 'dat.gui';

import { queryEl } from '@smoovy/utils';

import {
  hybridSmoothScroll, nativeSmoothScroll, Scroller, ScrollerEvent, smoothScroll,
} from '../src';

function createScroller(type: string) {
  const doc = document.documentElement;

  if (scroller) {
    scroller.destroy();
  }

  doc.classList.forEach(cls =>  {
    if (cls.startsWith('scroller-')) {
      doc.classList.remove(cls);
    }
  });

  doc.classList.add(`scroller-${type}`);

  switch (type) {
    case 'default':
      scroller = smoothScroll(queryEl('main'), {
        touch: {
          enableMouseEvents: true
        }
      });

      setTimeout(() => {
        scroller?.scrollTo({ y: 500 }, true);
        scroller?.scrollTo({ y: 1500 }, true);
        scroller?.scrollTo({ y: 2000 }, true);
      }, 2000);
      break;

    case 'native':
      scroller = nativeSmoothScroll(queryEl('main'));
      break;

    case 'hybrid':
      scroller = hybridSmoothScroll({
        element: {
          container: document.documentElement,
          wrapper: document.querySelector('main')!
        }
      }, {
        behaviors: {
          remap: (scroller) => {
            return scroller.on(ScrollerEvent.TRANSFORM_DELTA, (delta: any) => {
              delta.x += delta.y;

              return delta;
            });
          }
        }
      });
      break;
  }
}

function updateDirection(dir: string) {
  document.documentElement.classList.forEach(cls => {
    if (cls.startsWith('scrolldir-')) {
      document.documentElement.classList.remove(cls);
    }
  });

  document.documentElement.classList.add(`scrolldir-${dir}`)
}

let scroller: Scroller | undefined;
const gui = new dat.GUI();
const config = {
  scroller: {
    dir: 'vertical',
    type: 'default',
  },
};

createScroller(config.scroller.type);
updateDirection(config.scroller.dir);

gui.add(config.scroller, 'type', {
  Default: 'default',
  Native: 'native',
  Hybrid: 'hybrid'
}).onChange((type) => createScroller(type));

gui.add(config.scroller, 'dir', {
  Vertical: 'vertical',
  Horizontal: 'horizontal'
}).onChange((dir) => updateDirection(dir));