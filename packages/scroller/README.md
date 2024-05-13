# @smoovy/scroller
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller)](https://www.npmjs.com/package/@smoovy/scroller) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller)

## Installation
```sh
npm i @smoovy/scroller
```

## Usage
Smooth scrolling is split up into two different approaches: native and default. With "native", you get the best accessibility, since it just animates the scroll position of the window or container.

If you want to have more control and use a CSS transform-based scrolling, you can use the `DefaultScroller`. It'll create necessary DOM elements (container and wrapper) and use those to move the content.

In order to use the native or default scroller you can just import it from the package and create a new instance. Here's how you can create both types:


### Using the native scroller

```ts
import { NativeScroller } from '@smoovy/scroller/native';

const scroller = new NativeScroller();

// enable mouse pointer events for drag (all options at the bottom)
const scroller = new NativeScroller({
  pointerEvents: true
});
```
> Configuration is optional. If the config is omitted, the window will be used as a container.


### Using the default scroller
```ts
import { DefaultScroller } from '@smoovy/scroller/default';

const scroller = new DefaultScroller();

// make it slower (all options at the bottom)
const scroller = new DefaultScroller({
  damping: 0.08
});
```
> Configuration is optional. If the config is omitted, the body will be used as a container.

### Using just the virtual scroller
Sometimes you just want to have the controls for scrolling. For that you can just create the a core scroller.
This will give you the ability to customize the scrolling experience from scratch with all the controls taken care of (touch, wheel events, locking etc.).

```ts
import { Scroller } from '@smoovy/scroller/core';

const scroller = new Scroller();
```
> Note: DefaultScroller and NativeScroller are just variations of the Scroller.

### Listening to events
There are two types of scroll positions: `output` and `virtual`. The output position is the current *animated position*. The virtual position is the *animated position* the output is animating towards. So the virtual is always in sync with the "native" scroll position, while output is where the animation is currently at. You can listen to both:

```ts
scroller.onScroll(({ x, y }) => {
  console.log('scrolled to', x, y);
});

scroller.onVirtual(({ x, y }) => {
  console.log('will scroll to', x, y);
});

```
If you want to listen to resize events you simply attach this listener:
```ts
scroller.onResize(() => {
  console.log('content has changed size or window resized');
});
```


### Locking the scroller
All variations come with a locking mechanism, that allows for multiple contexts to lock the scroller.
This is done to ensure that, on your website, you can allow multiple components to lock the same scroller and ensure it's locked as long as the component requests it.

```ts
// lock a scroller completely
scroller.lock();

// unlock a scroller
scroller.lock(false);

// lock the scroller with context
scroller.lock(true, 'menu');
scroller.lock(true, 'other-component');

scroller.lock(false, 'menu') // still locked because of other-component
scroller.lock(false, 'other-component'); // full unlocked now

// listening for locks
scroller.onLock(({ locked }) => {
  console.log('scroller has been ' + (locked ? 'locked' : 'unlocked'));
});
```

It's also possible to only lock certain functionalities of the scroller.
Sometimes you want to disable user interaction, but still be able to control the scroller programmatically.

```ts
// disable user controls (touch, wheel etc. only)
scroller.lock({ controls: true }, 'menu');

// this still works
scroller.scrollTo({ y: 100 });

// enable user controls for the menu lock
scroller.lock({ controls: false }, 'menu');
```

### Scroll to and tween to
Each scroller can be controlled programmatically with the `scrollTo` method.
After the new position is set it will animate to that position. But you can also skip this animation and scroll to the position immediately.

```ts
// scroll to the position 500
scroller.scrollTo({ y: 500 });

// jump to the position 500 immediately
scroller.scrollTo({ y: 500 }, true);
```

There's no built-in tween engine or easing function for the animation. Since most of the time you're already using one. So in order to animate the position with a tween you could do the following.

```ts
tween.fromTo({ y: scroller.output.y }, { y: 500 }, {
  onUpdate: (pos) => scroller.scrollTo(pos, true);
})
```

## Configuration
| Name              | Type                  | Default | Description                                                                                                             |
|-------------------|-----------------------|---------|-------------------------------------------------------------------------------------------------------------------------|
| damping           | number                | 0.1     | The damping value used to align the current position with the new position.                                             |
| autoStart         | boolean               | true    | Whether to start the ticker immediately.                                                                                |
| threshold         | number                | 0.001   | The threshold used to determine when the scroll animation has settled (ended).                                                  |
| frequency         | number                | 60      | The refresh rate that's being simulated to achieve frame-independent damping.                                           |
| keyboardEvents    | boolean               | true    | Whether to allow keyboard events to simulate the native behavior of the browser.                                        |
| lineHeight        | number                | 16      | The default line height of the browser used for legacy delta calculations and keyboard events.                          |
| wheelMultiplier   | number                | 1       | A multiplier for the wheel delta value to make scrolling go faster, usually resulting in less natural feeling.          |
| pointerEvents     | boolean               | false   | Whether to allow the pointer to drag the content and simulate touch events with the mouse, including a slight inertia.  |
| pointerMultiplier | number                | 1       | A multiplier for the pointer drag effect, altering the pivot point during drag.                                         |
| pointerVelocity   | number                | 25      | A multiplier for the pointer drag effect on velocity before the user releases the button.                               |
| touchMultiplier   | number                | 1       | A multiplier for the touch drag effect, altering the pivot point during drag.                                           |
| touchVelocity     | number                | 20      | A multiplier for the touch drag effect on velocity before the user removes his finger.                                  |
| touchEvents       | boolean               | true    | Whether to enable touch events and simulate the mobile touch experience.                                                |
| inertiaTarget     | Window \| HTMLElement | Window  | The target element or window used to track events for the inertia and touch simulation. Optional.                       |
| wheelTarget       | Window \| HTMLElement | Window  | The target element or window used to track events for the mouse wheel events. Optional.                                 |

### Default scroller config
| Name     | Type                       | Default                                          | Description                                                                                                             |
|----------|----------------------------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| container| HTMLElement                | document.body                                    | The container element used as a viewport for the scrollable area, containing the content. Optional.                      |
| wrapper  | HTMLElement                | None                                             | The wrapper element that contains the content, defining the scroll limit. Transforms are set on this element. Optional.  |
| focus    | boolean                    | true                                             | Whether to enable focus bypass, scrolling to the element that has been focused.                                         |
| styles   | Partial<CSSStyleDeclaration>| { width: '100%', height: '100%', overflow: 'hidden' } | Styles set on the container element to define its appearance and behavior. Optional.                                    |
> All core configurations apply to this too

### Native scroller config
| Name       | Type                      | Default         | Description                                                                                                               |
|------------|---------------------------|-----------------|---------------------------------------------------------------------------------------------------------------------------|
| container  | HTMLElement \| Window     | document.body   | The container element used as a viewport for the scrollable area, within which the content sits. Optional.                |
| wrapper    | HTMLElement               | None            | The wrapper element that contains the content and defines the scroll limit. Transforms are set on this. Optional.         |
| focus      | boolean                   | true            | Enables focus bypass, which scrolls to the focused element during scroll animation, preserving default behavior. Optional. |
> All core configurations apply to this too


## Accessibility breakdown
You should always be aware of the limitations when using scrolljacking to not worsen the user experience. Especially when optimizing for a lot of different devices. Sometimes it's better to remove smooth scrolling alltogether (e.g. on mobile) to ensure the user gets the same scrolling expericence he's familiar with.

| Function | Native | Default
| -------- | ------ | -------
| Scroll to focus element    |  ✅    | ✅
| Keybard scroll controls | ✅ | ✅ 
| Simulate touch events | ✅ | ✅
| Pointer touch events | ✅ | ✅
| Lock scroll position | ✅ | ✅
| Scroll to search result | ✅ | ❌
| Native scrollbar control | ✅ | ❌
| Native sticky elements | ✅ | ❌
| Native CSS scroll-snap | ❌ | ❌

Also if you want to make sure to give the user the best experience, I suggest to use a detection for `prefers-reduced-motion` and disable smooth scrolling when the user prefers low-animated websites.

```ts
if ( ! window.matchMedia('(prefers-reduced-motion)').matches) {
  // initialize smooth scrolling
} else {
  // use native scrolling
}
```


## Experience it in action
* [The Variable](https://thevariable.com/)
* [Design Embraced](https://designembraced.com/)
* [Selected](https://selectedbase.com/)
* [rootsandfriends](https://rootsandfriends.com/)
* [Passepartout](https://passepartout.undesigned.studio/)

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