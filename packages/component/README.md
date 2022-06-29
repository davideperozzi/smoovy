# @smoovy/component
[![Version](https://flat.badgen.net/npm/v/@smoovy/component)](https://www.npmjs.com/package/@smoovy/component) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/component)

Very basic component manager

## Installation
```sh
npm install --save @smoovy/component
```

## Basic usage
every properties are static, so you can't use multiple managers in different scopes. To create a component simply use the `@component` decorator like this:

```ts
import { component } from '@smoovy/component';

@component({
  // this is a simple `querySelectorAll` call
  selector: 'footer'
})
export class Footer {
  public constructor(
    protected element: HTMLElement
  ) {
    // do init stuff with the element
  }
}
```

## Lifecycle
The lifecycle is straight forward: Component gets created -> Component gets destroyed. In order to capture the destroy event and do some cleanup tasks, use the interface `OnDestroy`:

```ts
@component({
  selector: 'footer'
})
export class Footer implements OnDestroy {
  public constructor(
    protected element: HTMLElement
  ) {
    this.element.style.display = 'block';
  }

  public onDestroy() {
    this.element.style.display = null;
  }
}
```

## Conditional rendering
Sometimes you don't want a component to be initialized. E.g. it's only an animation for desktop devices with a screen size bigger than 1024px. You can add a condition to the component initialization like this:

```ts
@component({
  ...
  condition: () => window.innerWidth > 1024
})
export class Footer {
  ...
}
```

## Update components
Sometimes you need to refresh the component state. For instance if the route hase changed. You want to get rid of all the old components and inject the new ones:

```ts
import { ComponentManager } from '@smoovy/component';

// since there can only be one manager the update is quit simple
ComponentManager.update();

// only update components inside this scope element
// otherwise the root will be used, which is `document.body`
ComponentManager.update(document.querySelector('footer'));

// do not remove old components. Keep them running, even
// if they're not in the dom. This can be usefule if you
// have animations handled by components that are no longer
// in the dom and still need some time
ComponentManager.update(document.body, false);
setTimeout(() => ComponentManager.update(document.body), 200);
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
