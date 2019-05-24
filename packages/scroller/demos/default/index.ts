import { Scroller } from '../../src';
import { CssTransformOutput } from '../../src/outputs/css-transform-output';

const target = document.querySelector('main') as HTMLMainElement;
const scroller = new Scroller(target, {
  output: {
    cssTransform: {
      sectionSelector: 'section'
    }
  }
});


