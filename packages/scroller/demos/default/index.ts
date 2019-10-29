import { smoothScrolling } from '../../src';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScrolling({ element });

// scroller.onDelta((pos) => { console.log(pos); });
