# @smoovy/tween
[![Version](https://flat.badgen.net/npm/v/@smoovy/tween)](https://www.npmjs.com/package/@smoovy/tween) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/tween)

A small and easy-to-use tween engine built on top of [@smoovy/ticker](../ticker/README.md). It's meant to be simple and not include too many edge cases. So basically tween values. It supports *fromTo*, *timelines*, *stagger* etc. like many animation libraries.

## Installation
```sh
yarn add @smoovy/tween
```
or
```sh
npm install --save @smoovy/tween
```

## Usage
Import the `tween` method:
```js
import { tween } from '@smoovy/tween';
```

### Starting a simple tween
Every tween is going to be started with the `fromTo` function:

```js
tween.to(
  { x: 0 },
  { x: 100 },
  {
    duration: 200,
    on: {
      update: ({ x }) => {
        // Do something with "x"
      }
    }
  }
);
```

### Using easings
The following easing functions are supported out-of-the-box:

```js
import { easings } from '@smoovy/easings';

easings.easeInOutBounce
easings.easeInExpo
...
```

To use one of these, you can just add it to the tween options:

```js
tween.to(
  { x: 0 },
  { x: 100 },
  {
    duration: 200,
    easing: easings.ExpoOut
  }
);
```
> The default easing is linear: `(x) => x`

You can implment your own easing functions. Just follow this pattern:
```ts
type Easing = (x: number) => number
```

### Object mutation
By default the object you're passing as an "input" will be mutated.
To prevent mutation, you need to disable it:

```js
const someValues = { x: 0, y: 0 };

tween.to(
  someValues,
  { x: 100, y: 100 },
  {
    duration: 200,
    mutate: false,
    on: {
      update: (values) => {
        // someValues.x is still 0
      }
    }
  }
);
```

### Apply changes to the DOM directly
Supports `opacity` and all `transforms`

```js
const element = document.querySelector('.target');

tween.to(
  element,
  { x: 100, y: 100 },
  { duration: 200 }
);

// rotate and move
tween.to(
  element,
  { x: 100, rotate: 100 },
  { duration: 200 }
);

// change the units to use
tween.to(
  element,
  { y: 100 },
  {
    duration: 200,
    units: { y: '%' }
  }
);
```

### Stagger

```js
const elements = document.querySelectorAll('.target');

tween.staggerTo(
  element,
  { x: 100, y: 100 },
  {
    stagger: {
      // determines the intersection perecentage between each tween
      // it uses the neighbors duration so you don't have to keep track
      // of the duration yourself. This makes all items start 30% before
      // the end of the next tween
      offeset: -0.3,

      // this would start all simultaneously
      // offset: -1.0
    },
    timline: {
      onComplete: () => console.log('all tweens complete')
    }
    // ... same properties as above
  }
);
```

### Timeline
```js
const element1 = document.querySelectorAll('.target1')
const element2 = document.querySelectorAll('.target2')
const timeline = tween.timeline({
  onComplete: () => conosole.log('timeline completed')
});

timeline.add(tween.to(
  element1,
  { x: 100, y: 100 },
  { duration: 200 }
))
timeline.add(tween.to(
  element2,
  { x: 100, y: 100 },
  { duration: 200 }
), {
  offset: -0.2 // start 20% before element1 has finished (overlap)
});

timeline.start();
```

### Promisified
All tweens, staggers and timelines can be awaited.

```js
const tween1 = await tween.to(
  { x: 0 },
  { x: 100 },
  {
    duration: 200,
    easing: easings.ExpoOut
  }
);

// will be reversed and repeated once the first anaimation is done
tween1.resverse().start();
```

### Infinite repetition
There's no option for that, but you can combine `onComplete` and `start`:

```js
// this will loop idefinitely between 0 and 100 (back and forth)
// you can remove `reverse` to so it always goes form 0 to 100
const tween1 = tween.to(
  { x: 0 },
  { x: 100 },
  {
    duration: 200,
    easing: easings.ExpoOut,
    onComplete: () => tween1.reverse().start()
  }
);
```

### All the tween options
Below are all the available tween options.
> `Values` represents the input type
```ts
// An easing implementation
// Default: Circ.out
easing: EasingImplementation;

// The duration in milliseconds
// Default: 0
duration: number;

// Prevent object mutation
// Default: true
mutate: boolean;

// Overwrite tween for same object reference
// Default: true
overwrite: boolean;

// Delay before start (in ms)
delay: number;

// Determines if the tween should start immediately
// Default: true
autoStart: boolean;

// All callbacks (optional)
onStop: () => void;
onPause: () => void;
onStart: () => void;
onReset: () => void;
onDelay: (passed: number, progress: number) => void;
onUpdate: (values: Values, progress: number, target: HTMLElement) => void;
onOverwrite: () => void;
onComplete: () => void;
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).