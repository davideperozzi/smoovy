import { observe } from '../../src';

const box1 = document.querySelector('.box1') as HTMLElement;
const observable1 = observe(box1);
const observable2 = observe(window);

console.log(observable1, observable2);

observable1.events.on('update', (state) => {
  console.log('state1 updated', state);
});

observable2.events.on('update', (state) => {
  console.log('state2 updated', state);
});

