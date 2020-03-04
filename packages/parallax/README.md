# @smoovy/parallax
[![Version](https://flat.badgen.net/npm/v/@smoovy/parallax)](https://www.npmjs.com/package/@smoovy/parallax) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/parallax)

Predictable parallax effects

## Usage
```sh
npm install --save @smoovy/parallax
```

```ts
import { ParallaxController, ParallaxElement } from '@smoovy/parallax';

const elements = document.querySelectorAll('[data-parallax]');
const controller = new ParallaxController({ offsetX: 0.5, offetY: 0.5 });

elements.forEach(element => {
  controller.attach(new ParallaxElement(element, {
    speed: parseFloat(element.dataset.parallax)
  }));
});

const item = new ParallaxItem({
  speed: 0.5,
  position: () => { x: 0, y: 100 },
  update: ({ x, y, progress }) => {}
});

controller.attach(item);

window.on('scroll', () => {
  controller.update({ x: window.scrollX, y: window.scrollY });
});
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
