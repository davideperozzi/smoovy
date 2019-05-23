# smoovy

[![CircleCI](https://flat.badgen.net/circleci/github/davideperozzi/smoovy/master)](https://circleci.com/gh/davideperozzi/smoovy/tree/master)
![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)
[![License](https://flat.badgen.net/badge/license/MIT/blue)](./LICENSE)

## Synopsis
**smoovy** is just a collection of small and useful js packages preventing copy & paste. The goal is to use as minimum dependencies as possible to guarantee a **small final bundle**. Also to keep the code clean, small and simple.

## Packages
| Name| Version | Size |
| --- | --- | --- |
| [@smoovy/tween](./packages/tween/README.MD) | [![Version](https://flat.badgen.net/npm/v/@smoovy/tween)](https://www.npmjs.com/package/@smoovy/tween) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/tween) |
| [@smoovy/ticker](./packages/ticker/README.MD) | [![Version](https://flat.badgen.net/npm/v/@smoovy/ticker)](https://www.npmjs.com/package/@smoovy/ticker) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/ticker) |
| [@smoovy/utils](./packages/utils/README.MD) | [![Version](https://flat.badgen.net/npm/v/@smoovy/utils)](https://www.npmjs.com/package/@smoovy/utils) | ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/utils) |

## Getting started
Choose a package you want and install. Easy as that:
```sh
npm install --save @smoovy/<package>
```

## Roadmap 2019
- [ ] 📦 Migrate `@smoovy/scroller`
- [ ] 💡 Integrate e2e tests with BrowserStack
- [ ] 📦 Create `@smoovy/parallax` (parallax effect math)
- [ ] 📦 Create `@smoovy/timeline` (timeline for tweens)
- [ ] 📦 Create `@smoovy/el-state` (element state watcher)
- [ ] 📦 Create `@smoovy/text-split` (easy text splitting)
- [ ] 💡 Improve tween demos
- [ ] 💡 Improve documentation
- [ ] 💡 Improve testing


## Workflow
This is simple monorepo consisting of the packages mentioned above.
> Every commands related to a package will be executed from the root directory via `scripty`

### Building a package
To ensure the best result, packages are created with rollup. The following formats are supported: `cjs`, `umd` and `esm`.
```sh
npm run build:package <name>
```

### Testing a package
Packages will be tested with `jest`. The dist files will be used for testing.
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