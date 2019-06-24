# @smoovy/scroller-shared
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller-shared)](https://www.npmjs.com/package/@smoovy/scroller-shared) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller-shared)

Some base components for a basic scroller.

## Installation
```sh
npm install --save @smoovy/scroller-shared
```

## Usage
Choose the component you want to add to your scroller module and simply include it. E.g.:
```js
import { MouseWheelInput } from '@smoovy/scroller-shared';
```

## Inputs
| Class | Config key | Options
| - | - | - |
| MouseWheelInput | mouseWheel | `multiplier: number`<br>`multiplierFirefox: number`
| TouchSwipeInput | touchSwipe | `multiplier: number`

## Transformers
| Class | Config key | Options
| - | - | - |
| ClampTransformer | clamp | -

## Outputs
| Class | Config key | Options
| - | - | - |
| CssTransformOutput | cssTransform | `sectionSelector: string`<br>`sectionPadding: number`<br>`firefoxFix: boolean`

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