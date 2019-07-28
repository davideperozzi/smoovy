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

The observer is separated into two main components. The `ViewportObserver` and the `ElementObserver`.

### Observing the viewport (a.k.a. window)
```js
import { ViewportObserver } from '@smoovy/observer';

const listener = ViewportObserver.changed(state => {
  console.log(`The viewport size is ${state.width}x${state.height}`);
});
```

To remove the listener you can simply call the `remove` method:
```js
listener.remove();
```

> The viewport observer's target is always the current `window` object

#### Throttling the change listener calls
This will throttle the changed callback to **100ms**:
```js
ViewportObserver.changed((state) => {}, 100);
```

#### Updating the viewport manually
```js
ViewportObserver.update();
```

#### Accessing the state at any time
```js
const state = await ViewportObserver.state;
```

#### When does a viewport change occur?
The change gets called everytime the user triggers the `resize` event on the `window` element. The `ViewportObserver` also makes sure to emit only on the next animation frame.

### Observing an element
By observing an element you automatically create a state inside the `ElementObserver`. This will be your reference to the current state of the element:

```js
import { ElementObserver } from '@smoovy/observer';

const element = document.querySelector('#test');
const state = ElementObserver.observe(element);
```

#### Listening/Unlistening for element changes
```js
const listener = state.changed(({ size, offset }) => {
  console.log('Element size:', size);
  console.log('Element page offset:', offset);
});

// Stop listening
listener.remove();
```

> Changes occur when the `ViewportObserver` changes or the `MutationObserver` detects changes inside the `document.documentElement`

#### Throttling the change listener calls
This will throttle the changed callback to **100ms**:
```js
state.changed((state) => {}, 100);
```

#### Updating the element state manually
```js
state.update();
```

#### Removing the element state from the observer
```js
state.destroy();
```

### Creating a new element observer
Sometimes you want to disable the `MutationObserver` or just want a separate stack of elements to observer. You can simply create a new `ElementObserver` by instantiating it:

```js
const observer = new ElementObserver({
  viewportThrottle: 200,
  mutationThrottle: 100
});

const element = document.querySelector('#test');
const state = observer.observe(element);
```

#### Adding mutators
You can add multiple targets to listen for DOM mutations:

```js
new ElementObserver({
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
