# @smoovy/observer
[![Version](https://flat.badgen.net/npm/v/@smoovy/observer)](https://www.npmjs.com/package/@smoovy/observer) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/observer)

Easily observe states of HTML elements and the viewport.

## Installation
```sh
npm install --save @smoovy/observer
```

## Why?!

Operations like `window.innerWidth` and `element.offsetTop` will have an impact on the performance if not used properly. So this package is useful to avoid [layout thrashing](https://devhints.io/layout-thrashing) by batching all of the expensive calls together and only executing them if needed.

## Usage

For most use cases using the exposed `observe` and `unobserve` methods is sufficient.

### Observing the window
```js
import { observe } from '@smoovy/observer';

const observable = observe(window);
const unlisten = observable.onUpdate(() => {
  const size = observable.offset;

  console.log(`The viewport size is ${size.width}x${size.height}`);
});
```

To remove the listener and observable you can simply call the the `unobserve` method:
```js
import { unobserve } from '@smoovy/observer';

// Remove update listener
unlisten();

// Remove observable from detection
unobserve(observable);
```

#### Throttling the update listener calls
This will throttle the update callback to **100ms**:
```js
import { throttle } from '@smoovy/utils';

const observable = observe(window).onUpdate(
  throttle(() => {}, 100)
);
```

#### Updating the observable manually
```js
observable.update();
```

#### When does a viewport update occur?
The update callback is called everytime the user triggers the `resize` event on the `window`; or through  `MutationObserver`s change detection.

### Observing an element
Observing elements works through the same API as with the window.

```js
import { observe } from '@smoovy/observer';

const element = document.querySelector('#test');
const observable = observe(element);
```

#### Listening/Unlistening for element updates
```js
const listener = observable.onUpdate(({ bounds, offset }) => {
  console.log('Element bounds:', bounds);
  console.log('Element page offset:', offset);
});

// Stop listening
listener();
```

#### Updating the element state manually
```js
observable.update();
```

#### Removing the element state from the observer
```js
import { unobserve } from '@smoovy/observer';

unobserver(observable);
```

### Creating a new observable controller
Sometimes you want to disable the `MutationObserver` or just want a separate stack of elements to observer. You can simply create a new `ObservableController` by instantiating it:

```js
import { ObservableController } from '@smoovy/observer';

const observer = new ObservableController({ throttle: 200 });

const element = document.querySelector('#test');
const observable = observer.add(element);
```

#### Adding mutators
You can add multiple targets to listen for DOM mutations:

```js
new ObservableController({
  mutators: [
    {
      target: document.body,
      options: {
        attribues: true,
        attributesFilter: [ 'style' ]
        subtree: true
      }
    }
  ]
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
