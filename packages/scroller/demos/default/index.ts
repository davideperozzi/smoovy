import { smoothScrolling } from '../../src';

const element = document.querySelector('main') as HTMLElement;
const scroller = smoothScrolling({ element }, { wheel: { multiplier: 0.5 } });

// scroller.lock();
// scroller.onDelta((pos) => { console.log(pos); });
// scroller.onScroll((position) => console.log(position.y));
// scroller.scrollTo({ y: 500 }, 500);
