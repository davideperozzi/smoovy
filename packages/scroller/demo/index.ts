import { NativeScroller, ElementScroller, Scroller } from '../src';

const scroller = new ElementScroller({
  container: document.querySelector('main')!,
  pointerEvents: true
});

scroller.on('inertiastart', () => console.log('start'));
scroller.on('inertiaend', () => console.log('end'));

// scroller.onScroll((pos) => console.log('pos', pos));
// scroller.onVirtual((pos) => console.log('virt', pos));
//

setTimeout(() => {
  // scroller.scrollTo({ x: 0, y: 500 });
}, 500);