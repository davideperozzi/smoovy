# @smoovy/scroller
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller)](https://www.npmjs.com/package/@smoovy/scroller) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller)

Smooth scrolling based on [@smoovy/scroller-core](../scroller-core).

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
This will only tween the selected sections while they're visible:

```js
const target = document.querySelector('#target-el');
const scroller = new Scroller(
  target,
  {
    output: {
      cssTransform: {
        // This useses `querySelector` under da hood
        // so you can go crazy with this
        sectionSelector: 'section'
      }
    }
  }
);
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