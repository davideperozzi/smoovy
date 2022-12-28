# @smoovy/parallax
[![Version](https://flat.badgen.net/npm/v/@smoovy/parallax)](https://www.npmjs.com/package/@smoovy/parallax) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/parallax)

Predictable parallax effects

## Installation
```sh
yarn add @smoovy/parallax
```
or
```sh
npm install --save @smoovy/parallax
```

## Usage
A parallax item is simply a point that moves by the mangament of the state inside a context.
So if a state is updated all parallax items assgined to the context will be updated as well.

### Creating a parallax item
```js
import { parallax } from '@smoovy/parallax';

const item = parallax({
  speed: { y: 0.3 },
  context: 'custom-optional-context',
  element: document.querySelector('[data-parallax]'),
  onUpdate: (state, progress) => {
    console.log('current progress', progress * 100);
    console.log('current shift', state.shiftY);
  }
});
```

### Updating the state
States are always assigned to a context. The default context is named `default`.
This ensure that you can have different groups of items and calculations with
the same API.

```js
import { Parallax } from '@smoovy/parallax';

window.addEventListener('scroll', () => {
  Parallax.update({
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight,
    maxWidth: document.body.offsetWidth,
    maxHeight: document.body.offsetHeight
  }, 'custom-optional-context' /** default: default */);
});
```
> You should consider all of these calls (e.g. with @smoovy/observer)

### More options
```js
parallax({
  /**
   * Context to tell tell which updates to
   * listen to and which state to use
   *
   * @default default
   */
  context?: string;

  /**
   * Whether to enable "out-of-viewport" detection and stop updating
   * once the coordinates aren't visible to the user anymore
   *
   * @default true
   */
  culling?: boolean;

  /**
   * This enabled a special mode where the parallax item moves inside a
   * container. Usually an element with `overflow: hidden`. This applies
   * a scale to the item, so it won't show a gap when the user scrolls
   * by this item. It's as simple as: 1 + (gap * 2) / size. If there's
   * an element available it will be transformed.
   *
   * @default false
   */
  masking?: boolean;

  /**
   * Whether to normalize the shift value. If this is enabled, a value
   * for compensating starting and ending positions will be added to the
   * shift value. So if you have an item at the first section of your
   * viewport the starting position will be adjusted, so the shift will
   * be 0 if the scroll position is 0.
   *
   * @default true
   */
  normalize?: boolean;

  /**
   * The speed tells how fast the item should move in relation to the
   * scroll position. The initial position will always be reached when
   * the center position of the item and the viewport match. This means
   * if the item is in the center of the viewport the shift is 0.
   * A speed value of 0 means no shift, 1 means basicall fixed and everthing
   * in between, below and above will generate parallax effect
   *
   * @default { x: 0, y: 0 }
   */
  speed?: Partial<Coordinate>;

  /**
   * This will be used as a target, so the shift will be applied as
   * translate3d and the mask (if enabled) with `scale`
   *
   * @default null
   */
  element?: HTMLElement | {
    target: HTMLElement;
    transform?: boolean;
  };

  /**
   * Simply notifies you about the current state of the item and only will
   * be triggered if the item position has changed. You can make modifications
   * to the state here. For example remap the y value to x so it moves
   * horizontally when the user scrolls vertically
   */
  onUpdate?: (state: ParallaxState, progress: Coordinate) => void;
})
```

### Choosing the perfect speed value
The speed value defines how fast the point will move relative to it's initial position:

`0` means static. No movement

`1` means sticky. It moves with the scroll position

`-1` means "reverse sticky". It moves against the scroll position.

everything in between is a fraction of the scroll position (negative or positive).

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
