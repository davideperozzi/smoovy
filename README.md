# smoovy
[![Build Status](https://cicd.davideperozzi.com/api/badges/davideperozzi/smoovy/status.svg)](https://cicd.davideperozzi.com/davideperozzi/smoovy)
[![Codecov](https://img.shields.io/codecov/c/gh/davideperozzi/smoovy.svg?style=flat-square)](https://codecov.io/gh/davideperozzi/smoovy)
![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)
[![License](https://flat.badgen.net/badge/license/MIT/blue)](./LICENSE)

A collection of small and useful js packages for simple preventing copy & paste. The goal is to use as few dependencies as possible to guarantee a **small final bundle**.

## Packages
| Name| Version |
| --- | --- |
| [@smoovy/composer](./packages/composer) | [![Version](https://flat.badgen.net/npm/v/@smoovy/composer)](https://www.npmjs.com/package/@smoovy/scroller)
| [@smoovy/scroller](./packages/scroller) | [![Version](https://flat.badgen.net/npm/v/@smoovy/scroller)](https://www.npmjs.com/package/@smoovy/scroller)
| [@smoovy/observer](./packages/observer) | [![Version](https://flat.badgen.net/npm/v/@smoovy/observer)](https://www.npmjs.com/package/@smoovy/observer)
| [@smoovy/parallax](./packages/parallax) | [![Version](https://flat.badgen.net/npm/v/@smoovy/parallax)](https://www.npmjs.com/package/@smoovy/parallax)
| [@smoovy/tween](./packages/tween) | [![Version](https://flat.badgen.net/npm/v/@smoovy/tween)](https://www.npmjs.com/package/@smoovy/tween)
| [@smoovy/ticker](./packages/ticker) | [![Version](https://flat.badgen.net/npm/v/@smoovy/ticker)](https://www.npmjs.com/package/@smoovy/ticker)
| [@smoovy/emitter](./packages/emitter) | [![Version](https://flat.badgen.net/npm/v/@smoovy/emitter)](https://www.npmjs.com/package/@smoovy/emitter)
| [@smoovy/listener](./packages/listener) | [![Version](https://flat.badgen.net/npm/v/@smoovy/listener)](https://www.npmjs.com/package/@smoovy/listener)
| [@smoovy/router](./packages/router) | [![Version](https://flat.badgen.net/npm/v/@smoovy/router)](https://www.npmjs.com/package/@smoovy/router)
| [@smoovy/webgl](./packages/webgl) | [![Version](https://flat.badgen.net/npm/v/@smoovy/webgl)](https://www.npmjs.com/package/@smoovy/webgl)
| [@smoovy/utils](./packages/utils) | [![Version](https://flat.badgen.net/npm/v/@smoovy/utils)](https://www.npmjs.com/package/@smoovy/utils)

## Getting started
Choose a package you want to install. It's as easy as that:
```sh
yarn add @smoovy/<package>
```
or
```sh
npm install --save @smoovy/<package>
```

## Workflow
This is a simple monorepo consisting of some of the packages mentioned above.

### Building a package
To ensure the best result, packages are created with esbuild and tsc.
```sh
yarn build --scope=<name>
```

### Testing a package
Packages will be tested with `vitest`.
```sh
yarn test --scope=<name>
```
> Some packages are still missing tests. These will be excluded from the code coverage completely.

### Serving a package demo
The demo will be served and bundled with `vite`. Every demo must have a `index.html` file.
```sh
yarn dev --scope=<name>
```

### Linting a package
The `ESLinter` is being used for linting packages. Everything except the `src` folder will be ignored.
```sh
yarn lint --scope=<name>
```

## License
See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).
