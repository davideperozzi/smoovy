# @smoovy/tween
[![Version](https://flat.badgen.net/npm/v/@smoovy/tween)](https://www.npmjs.com/package/@smoovy/tween) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/tween)

A small and easy-to-use tween engine building on top of the [@smoovy/ticker](../ticker/README.md).

## Installation
```sh
npm install --save @smoovy/tween
```

## Usage
Import the `Tween` class as usual:
```js
import { Tween } from '@smoovy/tween';
```

### Starting a simple tween
Every tween is going to be started with the `fromTo` function:

```js
Tween.fromTo(
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
import { easings } from '@smoovy/tween';

easings.Linear.none
easings.Quad.in
easings.Quad.out
easings.Cubic.in
easings.Cubic.out
easings.Quart.in
easings.Quart.out
easings.Quint.in
easings.Quint.out
easings.Sine.in
easings.Sine.out
easings.Expo.in
easings.Expo.out
easings.Circ.in
easings.Circ.out
easings.Back.in
easings.Back.out
easings.Bounce.in
easings.Bounce.out
```

To use one of these, you can just add it to the tween options:

```js
Tween.fromTo(
  { x: 0 },
  { x: 100 },
  {
    duration: 200,
    easing: easings.Expo.out
  }
);
```
> The default easing is `Circ.out`

You can implment your own easing functions. Just follow this pattern:
```ts
type EasingImpl = (
  t: number, // time
  b: number, // start value
  c: number, // change
  d: number  // duration
) => number
```

> A cool tool for creating easing functions compatible with this package, you can take a look at this [this](http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm).

### Object mutation
By default the object you're passing as an "input" will be mutated. To prevent mutation, you need to disable it:

```js
const someValues = { x: 0, y: 0 };

Tween.fromTo(
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
interface TweenOptions<Values> {
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
  on: {
    stop: () => void;
    pause: () => void;
    start: () => void;
    reset: () => void;
    delay: (passed: number) => void;
    update: (values: Values) => void;
    overwrite: () => void;
    complete: () => void;
  }
}
```

## Modularity
To reduce the final bundle size even more, you can only import the modules you're really using. E.g.:

```js
import { Cubic } from '@smoovy/tween/m/easing';
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
