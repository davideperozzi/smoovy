# @smoovy/scroller
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller)](https://www.npmjs.com/package/@smoovy/scroller) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller)

## Installation
```sh
npm install --save @smoovy/scroller
```

## Examples
* [rootsandfriends.com](https://rootsandfriends.com/)
* [davideperozzi.com](https://davideperozzi.com/)
* [jobs.dorfjungs.com](https://jobs.dorfjungs.com/)

## Basic usage
You can simply start by importing the most basic scroller composition called `smoothScroll`:
```js
import { smoothScroll } from '@smoovy/scroller';
```

Lets say we have the following DOM on which we want to apply our scrolling:
```html
<main>
  <section>Section 1</section>
  <section>Section 2</section>
  <section>Section 3</section>
  <section>Section 4</section>
</main>
```

In order to activate the smooth scrolling for the `main` element, we need to create a new instance like this:
```js
const mainEl = document.querySelector('main');
const scroller = smoothScroll({ element: mainEl });
```
> This is the most basic setup. You can configure it down to the smallest detail

After you created the scroller the DOM should automatically transform to this (with default settings):
```html
<main>
  <div
    class="smoovy-container"
    style="width: 100%; height: 100%; overflow: hidden;"
  >
    <div class="smoovy-wrapper">
      <!-- Section 1, 2, ... -->
    </div>
  </div>
</main>
```
### Defining the correct dimensions
As you can see the `smoovy-container` tries to adjust its size to the parent element `main`. Since multiple scrollers can be nested inside each other we need to make the scroller aware of its dimensions. In order to do that, we can either configure the styles directly **by config** or use the default styles that come with the scroller and **adjust our styling around the root element**.

Defining the dimesions on the parent (recommended):
```css
main { width: 100%; height: 100vh; }
```

Defining the dimensions by config:
```js
smoothScroll({ element }, {
  styles: {
    height: '100vh'
  }
});
```

### Configuring the behaviors
Each behavior can be configured individually. In order to configure the `smoothScroll`er, you can simply pass them into the second argument. Lets say we want to adjust the damping of the `lerpContent` behavior:

```js
smoothScroll({ element }, {
  lerp: {
    damping: 0.2
  }
});
```

### Adding additional behaviors
If you want to add new beahviors to an existing composition, you can add the to the `behaviors` object inside the configuration:

```js
smoothScroll({ element }, {
  behaviors: {
    yourBehavior: beahviorX(),
    // You can also override default behaviors:
    lerp: yourLerpBehavior({
      customConfig: 1
    })
  }
});
```

### Removing behaviors
If you want to remove a bevhaior, you simply override it with undefined in the configuration like this:

```js
smoothScroll({ element }, {
  behaviors: {
    lerp: undefined
  }
});
```

You can take a look at all available configurations by accessing the `Config` interface of all the behaviors inside [this folder](./src/behaviors).

### Listening for scroll events
You have to positions you can listen to. The output and virutal position. Read more about these to positions [here](#the-core). Most of the time you want to listen to the output position:
```js
scroller.onScroll(position => {
  // Do something with position.x or position.y
});
```

If you wan to get the virtual position you can use this listener:

```js
scroller.onVirtual(position => {
  // Do something with position.x or position.y
});
```
> The virtual position syncs with the delta value immediately

### Scroll & tween to positions
You have to options when you want to scroll programmatically. You can either scroll directly to a position or tween to a position. When you're using `scrollTo` the position simply gets updated with a matching delta value *once*. If you want to customize the animation you can use `tweenTo`. This allows you to control the speed, easing and auto kill mechanism.

```js
scroller.scrollTo({ y: 500 });
```

Of course when the delta value changes the event goes through the registered behaviors. So if you have, lets say a lerp behavior, which interpolates the position it'll do that with the delta value from `scrollTo` as well. You can disable this by adding the `skipOutputTransform` to the `scrollTo` method:

```js
scroller.scrollTo({ y: 500 }, true);
```
> Now, if the behaviors are configured correctly, it should jump directly to the requested position without animations.

You can also tween to a position like this:
```js
import { easings } from '@smoovy/tween';

scroller.tweenTo({ y: 500 }, {
  duration: 800,
  easing: easings.Expo.out,
  // The `force` allows to ignore userinteraction while animating.
  // Default: false
  force: true
});
```

### Updating the scroller
It will happen that you're going to make changes to the DOM while the scroller is active. For example a simple router driven by ajax could influence the dimensions on your application. In order to tell the scroller to update itself you would call the `recalc` method:
```js
scroller.recalc();
// or async
scroller.recalc(true);
```
> This will notify the dom and behaviors about a recalc, so they can react accordingly

### Locking & unlocking the scroller
The scroller can be locked in many different contexts in order to be sure that the scroller is locked as long a entity wants it to be locked. If you simply want to (un)lock the scroller you may access these methods:

```js
// Lock scroller
scroller.lock();

// Unlock again
scroller.unlock();

// Check if locked
scroller.isLocked();
```
> A lock will suppress the delta events coming from registered behaviors

A more advanced use-case is a simple menu, that locks the scroller if it's active. So you want to give the lock a context, so you can be sure it stays locked as long as the menu is enabled. You can achieve this by using named locks like this:
```js
// The menu gets enabled:
scroller.lock('menu');

// Another component locks the scroller too:
scroller.lock('something');

// The menu gets disabled:
scroller.unlock('menu');

// Scroller is still locked
// The other component unlocks as well:
scroller.unlock('something');

// The scroller is now fully unlocked again
scroller.isLocked('menu'); // false
scroller.isLocked('something'); // false
```

### Destroying the scroller
To say goodbye to your scroller, you can simply call the destroy method:
```js
scroller.destroy();
```
> This will also put the DOM to the previous state

## The architecture
The whole structure is very simple. The key components are the `core`, `dom` and `behaviors`. The core holds the dom and behaviors together and is responsible for the data beeing transmitted between these components:

```
+-------+                              +-----+ +-----------+
| core  |                              | dom | | behavior  |
+-------+                              +-----+ +-----------+
    |                                     |          |
    | Makes DOM accessible to behaviors   |          |
    |------------------------------------>|          |
    |                                     |          |
    |              Notifies about changes |          |
    |<------------------------------------|          |
    |                                     |          |
    | Notifies about changes              |          |
    |----------------------------------------------->|
    |                                     |          |
    |                                Request changes |
    |<-----------------------------------------------|
    |                                     |          |
```

### The core
The core is responsible for maintaining a stable position which will be distributed among the registered behaviors. The position is split into two: `virutal` and `output`. The virtual position is the most up-to-date position which represents the position the user anticipates. The output position will sync with this position either instantly or by a registered behavior. So if you're calling `onScroll` you will get the output position. If you want the virtual position call `onVirtual`.

### The behavior
A behavior is the part that tells the whole "organism" how to behave. Usually the behaviors are split into logical parts like: `mouseWheel`, `scrollTo`, `tweenTo`, etc. This allows us to disable, enable and configure components as we need them. Also it will reduce the file size and complexity in the end result (final bundle).

### The DOM
The dom is responsible for rendering and managing the DOM elements needed for most scrollers. It watches for changes, resizes, etc. and notifies the core about them. The behavior can listen to them too. So it's a very simple component which will trigger the `RECALC` event on the scroller instance when needed.

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
