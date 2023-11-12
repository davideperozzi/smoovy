import { Ticker } from '../src/ticker';

Ticker.main.add((delta, time) => {
  console.log('third');
}, 200);
Ticker.main.add((delta, time) => {
  console.log('second');
}, 100);

setTimeout(() => {
  Ticker.main.add((delta, time, kill) => {
    console.log('first');
  });
}, 1000);