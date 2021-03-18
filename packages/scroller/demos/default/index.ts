import { smoothScroll, ScrollerEvent, nativeSmoothScroll } from '../../src';
import { easings } from '@smoovy/tween';

const element = document.querySelector('main') as HTMLElement;
const scroller = nativeSmoothScroll(element);
