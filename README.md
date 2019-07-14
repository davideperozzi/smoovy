# smoovy

[![CircleCI](https://flat.badgen.net/circleci/github/davideperozzi/smoovy/master)](https://circleci.com/gh/davideperozzi/smoovy/tree/master)
[![Codecov](https://img.shields.io/codecov/c/gh/davideperozzi/smoovy.svg?style=flat-square)](https://codecov.io/gh/davideperozzi/smoovy)
![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)
[![License](https://flat.badgen.net/badge/license/MIT/blue)](./LICENSE)

## Synopsis
**smoovy** is just a collection of small and useful js packages preventing copy & paste. The goal is to use as minimum dependencies as possible to guarantee a **small final bundle**. Also to keep the code clean, small and simple.

## Main packages
| Name| Version | Size |
| --- | --- | --- |
| [@smoovy/scroller](./packages/scroller) | [![Version](https://flat.badgen.net/npm/v/@smoovy/scroller)](https://www.npmjs.com/package/@smoovy/scroller) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller) |
| [@smoovy/observer](./packages/observer) | [![Version](https://flat.badgen.net/npm/v/@smoovy/observer)](https://www.npmjs.com/package/@smoovy/observer) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/observer) |
| [@smoovy/tween](./packages/tween) | [![Version](https://flat.badgen.net/npm/v/@smoovy/tween)](https://www.npmjs.com/package/@smoovy/tween) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/tween) |
| [@smoovy/ticker](./packages/ticker) | [![Version](https://flat.badgen.net/npm/v/@smoovy/ticker)](https://www.npmjs.com/package/@smoovy/ticker) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/ticker) |
| [@smoovy/utils](./packages/utils) | [![Version](https://flat.badgen.net/npm/v/@smoovy/utils)](https://www.npmjs.com/package/@smoovy/utils) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/utils) |

## Getting started
Choose a package you want to install. Easy as that:
```sh
npm install --save @smoovy/<package>
```

## Roadmap 2019
- [ ] 📦 Create `@smoovy/parallax` (parallax effect math)
- [ ] 📦 Create `@smoovy/timeline` (timeline for tweens)
- [ ] 📦 Create `@smoovy/text-split` (easy text splitting)
- [ ] 💡 Improve tween demos
- [ ] 💡 Improve documentation
- [ ] 💡 Improve testing
- [ ] 💡 Improve code coverage


## Workflow
This is simple monorepo consisting of some of the packages mentioned above.
> Every commands related to a package will be executed from the root directory via `scripty`

### Building a package
To ensure the best result, packages are created with rollup. The following formats are supported: `cjs`, `umd` and `esm`.
```sh
npm run build:package <name>
```

### Testing a package
Packages will be tested with `jest` and `puppeteer`. The dist files will be used for testing.
```sh
npm run test:package <name>
```

### Serving a package demo
The demo will be served and bundled with `parcel`. Every demo must have a `index.html` file.
The source files will be used for the demo.
```sh
npm run serve:package <name> [<demo>, default]
```

### Linting a package
The `TSLinter` is used for linting packages. Everything except the `src` folder will be ignored.
```sh
npm run lint:package <name>
```

## License
See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).