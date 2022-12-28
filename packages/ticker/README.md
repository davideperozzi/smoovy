# @smoovy/ticker
[![Version](https://flat.badgen.net/npm/v/@smoovy/ticker)](https://www.npmjs.com/package/@smoovy/ticker) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/ticker)

A simple ticker using `requestAnimationFrame`.

## Installation
```sh
yarn add @smoovy/ticker
```
or
```sh
npm install --save @smoovy/ticker
```

## Usage
Import the ticker as usual:
```js
import { Ticker } from '@smoovy/ticker';
```

### Creating a ticker
```js
const ticker = new Ticker();
```

### Listening for the tick
Everytime you start listening for the tick, the ticker creates a new "thread",
which you can control:
```js
const thread = ticker.add(delta => {
  // Animate with delta value
});
```
> The delta value is the time difference to the tick before in milliseconds

To introduce the last two parameters passed to the callback, here's an example on how to kill a thread after 2 seconds:
```js
const thread = ticker.add((delta, time, kill) => {
  if (time >= 2000) {
    kill();
  }
});
```
You can also kill it like this:
```js
setTimeout(() => thread.kill(), 2000);
```
> Once the thread is marked as dead it will be removed on the next animation frame. After that, the reference will be removed.

### Overriding the tick automation
If you want to execute the tick function manually, you can enable the `override` flag. This prevents the internal ticking, after at least one thread is available:
```js
ticker.override = true;
```
You can then call the `tick` method manually:
```js
function tick(time) {
  ticker.tick(
    1    /** A static delta value */,
    time /** Optional time value */
  );

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
