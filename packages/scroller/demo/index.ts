import { NativeScroller, ElementScroller } from '../src';

const scroller = new NativeScroller({ bypass: true });
scroller.onScroll((pos) => console.log('pos', pos));
scroller.onVirtual((pos) => console.log('virt', pos));

setTimeout(() => {
  scroller.scrollTo({ x: 0, y: 500 });
}, 500);