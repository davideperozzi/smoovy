# @smoovy/router
[![Version](https://flat.badgen.net/npm/v/@smoovy/router)](https://www.npmjs.com/package/@smoovy/router) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/router)

A simple router for the browser with features like caching, preloading and page transitions.

## Installation
```sh
npm install --save @smoovy/router
```

## Usage
Import the router as usual and initialize it wit a base url:
```js
import { Router } from '@smoovy/router';

const router = new Router(window.location.href);
```

You can now tell the router to navigate manually like this:
```js
router.navigate('/about.html');
```
> The content of the response will be scanned for a `<title></title>` element. If it exists the title gets updated automatically.

This will update the history and emit some events. You can easily listen for those events. Here's a list of the events and their purpose:

| Name              | Description                 |
| ----------------- | --------------------------- |
| navigationstart   | Triggered before the router will update the history |
| navigationend     | Triggered on the very end of the navigation life cycle (after the content events and transitions) |
| navigationcancel  | Triggered when an old navigation cycle was overwritten because it was pending (e.g. loading content) |
| contentloadstart  | Triggered before the content will be loaded |
| contentloadend    | Triggered after the content loaded successfully |
| contentloadcancel | Triggered if a pending loading process got canceled  |
| contentloaderror  | Triggered if an error occured while loading the content |

You should consider accessing the event names like this:
```js
import { RouterEvent } from '@smoovy/router';

RouterEvent.NAVIGATION_START
RouterEvent.NAVIGATION_END
RouterEvent.NAVIGATION_CANCEL
RouterEvent.CONTENT_LOAD_START
RouterEvent.CONTENT_LOAD_END
RouterEvent.CONTENT_LOAD_CANCEL
RouterEvent.CONTENT_LOAD_ERROR
```

To simply listen to these events you should attach a listener directly to the router:

```js
router.on(RouterEvent.NAVIGATION_START, (event) => {
  // Do something on navigtation start
});
```
> You can find the structure of the event (`RouteChangeEvent`) [here](./src/router.ts)

### Connecting the router to links
A simple example, if you want to make your links "routable":
```js
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate(event.currentTarget.href);
  });
});
```

### Preloading content into the cache
Sometimes you can predict which link the user wants to open. E.g. he hovers over an a-tag. A very simple implementation for preloading the content would look like this:
```js
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', (event) => {
    router.preload(event.currentTarget.href);
  });
});
```
> You can add more complexity to this by adding a timeout and check if the user moves etc.

### Using a outlet to render the content
Most of the times you want to inject the content you've loaded immediately after it's available on the client side. To do this the router comes with an optional `RouterOutlet` feature. To use it, simply tell the router where to render the content to:

```js
// Use <main></main> as outlet
new Router(window.location.href, { outlet: 'main' });

// Use <div class="content"></div> as outlet
new Router(window.location.href, { outlet: 'div.content' });
```
> The selector will also be used to fetch the right node in the loaded content to place its children inside the active outlet

### Using page transitions
You can add page transitions to your router easily. To create a new page transitions, you need to inherit from the base `RouterTransition` class like this:

```js
import { RouterTransition } from '../transition';

class SampleTransition extends RouterTransition {
  // Executed before the new node will enter
  async afterEnter() {}

  // Executed after the new node has entered
  async beforeEnter({ root, from, to, trigger }) {}

  // Executed before the old node will leave
  // As an example, this will wait 500ms before leaving
  // and resuming the animation cycle
  async beforeLeave({ root }) {
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }

  // Executed after the old node has left
  async afterLeave() {}
}
```

You get an object passed into each cycle. This object is structured like this:
```ts
interface ActionArgs {
  root: HTMLElement;
  from: HTMLElement;
  to: HTMLElement;
  trigger: 'popstate' | 'user';
}
```
> You can take a look at the [fade transition](./src/transitions/fade.ts) for a real example

To finally register the page transition you can tell the router to add it to its stack of transitions:
```js
router.addTransition(new SampleTransition());
```
or register them inside the config
```js
new Router(window.location.href), {
  transitions: [
    new SampleTranistion()
  ]
})
```

#### Using page transition constraints
Sometimes you want to execute different transitions for specific routes. In order use this mechanism, you have to add some constraints to the `addTransition` method:

```js
// This transition will only be applied if the
// "from" and "to" route are matching the urls
// defined in the constraints
router.addTransition(new SepcialTransition(), [
  '/ => /about',
  '/about => /'
]);

// The constraints will be tested with regex
// So you can do something like:
router.addTransition(new SepcialTransition(), [
  '/blog/.*? => /blog/category/.*?'
]);

// Or if you registered the transitions by config
new Router(window.location.href), {
  transitions: [
    [
      new SampleTranistion(),
      '/blog/.*? => /blog/category/.*?'
    ]
  ]
})
```
> The default constraints are: `[ '.* => .*' ]`

### Listening for outlet events
If you want to hook into the outlet events without a transitions you can easily
use the same funcionality as with the router:

```js
import { RouterOutletEvent } from '@smoovy/router';

if (router.outlet) {
  router.outlet.on(
    RouterEvent.CONTENT_BEFORE_ENTER_START,
    (action) => {
      // action: ActionArgs
    }
  );
}
```

#### The available outlet events
All events containing the `*_ENTER_*`/`*_AFTER_*` are emitted before/after the new dom nodes will be inserted/removed.
The `*_START` and `*_END` part indicates the state of the transitions added to the router.
Please consider to use these constants.

```js
// Enter events
RouterOutletEvent.CONTENT_BEFORE_ENTER_START;
RouterOutletEvent.CONTENT_BEFORE_ENTER_END;
RouterOutletEvent.CONTENT_AFTER_ENTER_START;
RouterOutletEvent.CONTENT_AFTER_ENTER_END;

// Leave events
RouterOutletEvent.CONTENT_BEFORE_LEAVE_START;
RouterOutletEvent.CONTENT_BEFORE_LEAVE_END;
RouterOutletEvent.CONTENT_AFTER_LEAVE_START;
RouterOutletEvent.CONTENT_AFTER_LEAVE_END;
```


## Next steps
- [ ] Add unit tests
- [ ] Add browser tests
- [ ] Add more basic transitions

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
