# @smoovy/scroller
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller)](https://www.npmjs.com/package/@smoovy/scroller) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller)

Smooth scrolling based on [@smoovy/scroller-core](../scroller-core).

## Independent related packages
| Name| Version | Size |
| --- | --- | --- |
| [@smoovy/scroller-core](./packages/scroller-core) | [![Version](https://flat.badgen.net/npm/v/@smoovy/scroller-core)](https://www.npmjs.com/package/@smoovy/scroller-core) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller-core) |
| [@smoovy/scroller-shared](./packages/scroller-shared) | [![Version](https://flat.badgen.net/npm/v/@smoovy/scroller-shared)](https://www.npmjs.com/package/@smoovy/scroller-shared) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller-shared) |
| [@smoovy/scroller-tween](./packages/scroller-tween) | [![Version](https://flat.badgen.net/npm/v/@smoovy/scroller-tween)](https://www.npmjs.com/package/@smoovy/scroller-tween) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller-tween) |

## Installation
```sh
npm install --save @smoovy/scroller
```

## Usage
Import the scroller as usual:
```js
import { Scroller } from '@smoovy/scroller';
```

### Creating a pre-configured scroller
A simple scroller with minimal setup:

```js
const target = document.querySelector('#target-el');
const scroller = new Scroller(target);
```

### Creating a section-based scroller
This will only tween the selected sections while they're visible (improves performance):

```js
const target = document.querySelector('#target-el');
const scroller = new Scroller(
  target,
  {
    output: {
      cssTransform: {
        /**
         * If a section selector was passed, instead of animating
         * the whole content wrapper only the selected sections
         * will be animated. This gives you a huge performance boost
         * in most browser, but also comes with a lot to care for.
         * So use it wisely!
         */
        sectionSelector: 'section',

        /**
         * Adds a padding to the sections visible rect, so you can extend
         * the area in which the section will be recognized as visible,
         * thus beeing tweened outside of the viewport. This can come in handy,
         * if you have some effects playing in one section and overlapping into
         * another one
         */
        sectionPadding: 50
      }
    }
  }
);
```

### Modifying the mouse input
You can change the way the mouse emits delta changes. E.g. add a multiplier:
```js
...
{
  input: {
    mouseWheel: {
      multiplier: 2
    }
  }
}
```

### Modifying the scroll tween
To make changes to the tween transformer, you can pass the options like this:
```js

import { easings } from '@smoovy/tween';

...
{
  transformer: {
    tween: {
      duration: 2500,
      easing: easings.Quart.out
    }
  }
}
```

## More details
For more information on how this works take a look at the [core](../scroller-core) package.

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