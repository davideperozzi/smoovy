# @smoovy/parallax
[![Version](https://flat.badgen.net/npm/v/@smoovy/parallax)](https://www.npmjs.com/package/@smoovy/parallax) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/parallax)

Predictable parallax effects

## Usage
```sh
npm install --save @smoovy/parallax
```

### The controller
The controller is responsible to distribute the scroll position, viewport size, ... among the parallax items. You can create it like this:

```js
import { ParallaxController } from '@smoovy/parallax';

const controller = new ParallaxController();
```

#### The controller offset
You can determine the center point of the viewport for all items contained by the controller:

```js
new ParallaxController({
  offset: {
    x: 0.5,

    // 20% from the top
    // of the viewport
    y: 0.2
  }
})
```
> Default: `{ x: 0.5, y: 0.5 }`

#### Updating the controller
To update the controller and all it items you simply call this method everytime the desired state is not fulfilled. As an example, you could connect it to the window scroll event:

```js
window.addEventListener('scroll', () => {
  // Note: You should consider caching all these
  // calls (e.g. with @smoovy/observer)
  controller.update({
    scrollPosX: window.scrollX,
    scrollPosY: window.scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    contentWidth: document.body.offsetWidth,
    contentHeight: document.body.offsetHeight
  });
});
```

### The parallax item
A parallax item is simply a point that moves by the mangament of the controller. So if a controller is updated the parallax item will be updated as well.

#### The vector parallax item
The most basic parallax item is the `VectorParallaxItem`. You can use it like this:

```js
import { VectorParallaxItem } from '@smoovy/parallax';

const item = new VectorParallaxItem({
  speed: {
    x: 0,
    y: 0.2
  },
  state: () => {
    x: 100,
    y: 300,
    width: 300,
    height: 300
  },
  on: {
    update: (shift, progress) => {
      // Use the shift position to do
      // translations or other animations
    },
    destroy: () => {
      // The item was destroyed
    }
  }
});
```

#### The element parallax item
If you want to move a element to the shift value automatically, you can use the `ParallaxElementItem`. It's basically the vector parallax item with some extra features:

```js
import { ElementParallaxItem } from '@smoovy/parallax';

const element = document.querySelector('.some-element');
const item = new ElementParallaxItem(element, {
  // The speed of the element. From -1 to 1
  //
  // Default: 0
  speed: 0.3,

  // Disable automatic "in-viewport" check.
  //
  // Default: true
  culling: false,

  // Defines the center point of the element.
  // The line will meet with the viewport center line
  // on the initial element position
  //
  // Default { x: 0.5, y: 0.5 }
  offset: {
    x: 0.5,
    y: 1
  },

  // Disable translation on the element
  //
  // Default: true
  translate: false

  // Defines the precision of the latest translation value
  //
  // Default: 2
  precision: 1,

  // Defines the padding for the "in-viewport" check
  //
  // Default: { x: 0, y: 0 }
  padding: {
    x: 0,
    y: 0
  },

  // Events
  on: {
    update: (shift, progress) => {
      // Use the shift position to do
      // translations or other animations
    },
    destroy: () => {
      // The item was destroyed
    }
  }
});
```

#### Choosing the right speed value
The speed value defines how fast the element will move according to it's initial position:

`0` means static. No movement

`1` means sticky. It moves with the scroll position

`-1` means "reverse sticky". It moves against the scroll position.

everything in between is a fraction of the scroll position (negative or positive).


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
