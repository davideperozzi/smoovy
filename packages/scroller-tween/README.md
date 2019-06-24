# @smoovy/scroller-tween
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller-tween)](https://www.npmjs.com/package/@smoovy/scroller-tween) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller-tween)

A tween based scrolling module for [@smoovy/scroller-core](../scroller-core)

## Installation
```sh
npm install --save @smoovy/scroller-tween
```

## Usage
Import the tween module and expose it in your scroller:
```js
import { Scroller } from '@smoovy/scroller-core';
import { ScrollerTweenModule } from '@smoovy/scroller-tween';

class YourScroller extends Scroller {
  get moduleCtor() {
    return ScrollerTweenModule;
  }
}
```

## Transformers
| Class | Config key | Options
| - | - | - |
| TweenTransformer | tween | `duration: number`<br>`easing: EasingImpl`

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