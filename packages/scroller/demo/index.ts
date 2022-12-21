import * as dat from 'dat.gui';

import { queryEl } from '@smoovy/utils';

import { hybridSmoothScroll, nativeSmoothScroll, Scroller, smoothScroll } from '../src';

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
      scroller = smoothScroll(queryEl('main'));
      break;

    case 'native':
      scroller = nativeSmoothScroll(queryEl('main'));
      break;

    case 'hybrid':
      scroller = hybridSmoothScroll({
        element: {
          container: document.documentElement,
          wrapper: document.body
        }
      });
      break;
  }
}

let scroller: Scroller | undefined;
const gui = new dat.GUI();
const config = {
  scroller: {
    type: 'default'
  }
};

createScroller(config.scroller.type);

gui.add(config.scroller, 'type', {
  Default: 'default',
  Native: 'native',
  Hybrid: 'hybrid'
}).onChange((type) => createScroller(type));