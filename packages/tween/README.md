# @smoovy/tween
[![Version](https://flat.badgen.net/npm/v/@smoovy/tween)](https://www.npmjs.com/package/@smoovy/tween) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/tween)

A small and easy-to-use tween engine building on top of the [@smoovy/ticker](../ticker/README.md).

## Installation
```sh
yarn add @smoovy/tween
```
or
```sh
npm install --save @smoovy/tween
```

## Usage
Import the `tweenFromTo` method:
```js
import { tweenFromTo } from '@smoovy/tween';
```

### Starting a simple tween
Every tween is going to be started with the `fromTo` function:

```js
tweenFromTo(
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
tweenFromTo(
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

tweenFromTo(
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
// Default: false
paused: boolean;

// All callbacks (optional)
onStop: () => void;
onPause: () => void;
onStart: () => void;
onReset: () => void;
onDelay: (passed: number) => void;
onUpdate: (values: Values) => void;
onOverwrite: () => void;
onComplete: () => void;
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).