# @smoovy/utils
[![Version](https://flat.badgen.net/npm/v/@smoovy/utils)](https://www.npmjs.com/package/@smoovy/utils) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/utils)

These are just some utilities I need for my websites. I think they're pretty self explaining. So you can just click through the files to find out more!

## Installation
```sh
npm install --save @smoovy/utils
```

## Modularity
To reduce the final bundle size even more, you can only import the utils you're really using. E.g.:

```js
import { Browser } from '@smoovy/utils/m/browser';
import { objectDeepMerge } from '@smoovy/utils/m/object';
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