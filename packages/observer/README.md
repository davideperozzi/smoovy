# @smoovy/observer
[![Version](https://flat.badgen.net/npm/v/@smoovy/observer)](https://www.npmjs.com/package/@smoovy/observer) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/observer)

Easily observe states of HTML elements and the viewport.

## Installation
```sh
yarn add @smoovy/observer
```
or
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
const unlisten = observable.onChange(() => {
  console.log(`The viewport size is ${observable.width}x${observable.height}`);
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
import { throttle } from '@smoovy/utils/throttle';

const observable = observe(window).onChnage(
  throttle(() => {}, 100)
);
```

#### Updating the observable manually
```js
observable.update();
```

#### When does a viewport update occur?
The update callback is called everytime the user triggers the `resize` event on
the `window` or through `ResizeObserver`s change detection.

### Observing an element
Observing elements works through the same API as with the window.

```js
import { observe } from '@smoovy/observer';

const element = document.querySelector('#test');
const observable = observe(element, {
  visibilityDetection: true,
  resizeDetection: true
});
```

#### Listening/Unlistening for element updates
```js
const listener = observable.onChange(({ size, coord }) => {
  console.log('Element bounds:', size);
  console.log('Element page offset:', coord);
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

unobserve(observable);
```

#### Listening for visibility and dimension changes separately
The `onChange` callback bundles the `onDimChnage` and `onVisChange` callback
together. You can listen to either of those separately:

```js
const listenerVis = observable.onVisChange(() => {
  console.log('Element is now', observable.visible);
});

const listenerDim = observable.onDimChange(() => {
  console.log('Element has changed size', observable.size, observable.pos);
});
```

### Further configurations
```js
/**
 * The target to observe. Can be HTMLElement or Window
 */
target: HTMLElement | Window;

/**
 * Use `getBoundingClientRect()` instead of offsetWidth etc.
 *
 * Default = false
 */
useBounds?: boolean;

/**
 * Automatically listen for changes, resizes and updates once created
 *
 * Default = true
 */
autoAttach?: boolean;

/**
 * Whether to use visibility detection via the IntersectionObserver API.
 * You can configure it with a custom threshold.
 *
 * Default = false
 */
visibilityDetection?: boolean | IntersectionObserverInit;

/**
 * If `visiblityDetection` is enabled, this will delay the visibile
 * event by a defined number (ms)
 *
 * Default = 0
 */
visibilityDelay?: number;

/**
 * If `visibiltiyDetection` is enabled, remove the target from the
 * IntersectionObserver once it has been marked as visible
 *
 * Default = false
 */
detectVisibilityOnce?: boolean;

/**
 * Whether to detect dimension changes via the ResizeObserver API
 *
 * Default = false
 */
resizeDetection?: boolean | ResizeObserverOptions;

/**
 * Debounce is the number of milliseconds to wait for the next change.
 * So if the delta value is below this threshold the resize event will
 * be discarded and therefore the observable will not be updated.
 *
 * Default = 16.6
 */
resizeDebounce?: number;
```


## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
