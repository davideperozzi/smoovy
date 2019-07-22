# @smoovy/ticker
[![Version](https://flat.badgen.net/npm/v/@smoovy/ticker)](https://www.npmjs.com/package/@smoovy/ticker) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/ticker)

A simple ticker using `requestAnimationFrame` (and `setTimeout` as fallback). It tries to lock the frame rate with a similar approach as seen in the [PIXI.Ticker](http://pixijs.download/dev/docs/PIXI.Ticker_.html).

## Installation
```sh
npm install --save @smoovy/ticker
```

## Usage
Import the ticker as usual:
```js
import { Ticker } from '@smoovy/ticker';
```

### Creating a ticker
> The **default frame rate** goes from **20FPS to 120FPS**.

```js
// Create a default ticker
const ticker = new Ticker();

// Create a ticker with max. 30FPS
const ticker = new Ticker(30);

// Create a ticker with min. 30FPS and max. 60FPS
const ticker = new Ticker([ 30, 60 ]);
```

### Listening for the tick
Everytime you start listening for the tick, the ticker creates a new "thread",
which you can control:
```js
const thread = ticker.add(delta => {
  // Animate with delta value
});
```
> The more stable the animation gets, the closer the delta value comes to 1

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
> Once the thread is marked as dead it will be removed on the next animation frame. After that the reference will be removed.

### Overriding the tick automation
If you want to execute the tick function manually, you can enable the `override` flag. This prevent the internal ticking, after at least one thread is available:
```js
ticker.override = true;
```
Then you can call the `tick` method:
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

## Development commands
```js
// Serve with parcel
npm run serve

// Build with rollup
npm run build

// Run Jest unit tests
npm run test

// Run TSLinter
npm run lint
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
