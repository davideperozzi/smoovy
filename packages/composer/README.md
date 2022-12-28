# @smoovy/composer
[![Version](https://flat.badgen.net/npm/v/@smoovy/composer)](https://www.npmjs.com/package/@smoovy/composer) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/composer)

Very simple component/service system. Optimized for TypesScript usage.

## Installation
```sh
yarn add @smoovy/composer
```
or
```sh
npm install --save @smoovy/composer
```

## Component
A component is a very simple class, you just tell the composer what selector to use
and it'll manage all updates and detects if the element is still in the DOM etc.

```ts
import { component } from  '@smoovy/composer';

/** Elements with the attribute `data-test` will be selected */
@component('test')
class TestComponent {
  constructor(
    private element: HTMLelement
  ) {}

  /** On creation after the injectors are done */
  onCreate() {}

  /** After the element is no longer in the DOM */
  onDestroy() {}

  /** Helper method to make unlistening easier **/
  onListen() {
    return () => {
      console.log('unlisten from listeners');
    };
  }
}

// you can change specify a different selector like this
@component({
  selector: '.select-this-class'
})
```
> Lifecycle methods are: `onCreate`, `onListen` and `onDestroy`. All are optional
´
### Component config
You can inject config from the element dataset into your component like this:

```html
<div
  data-test-message="Hello Universe!"
  data-test-count="8"
></div>

<!-- It's also possible to define an object. So the following is the same: -->
<div
  data-test='{ "message": "Hello Universe!", "count": 8 }'
></div>
```
> If you define both the "non-json" value has priority

```ts
import { component, config } from  '@smoovy/composer';

@component('test')
class TestComponent {
  @config('message')
  private message: string;

  @config('count', {
    type: Number,
    parse: (val: number) => val * val
  })
  private count = 0;

  onCreate() {
    console.log(this.message); // "Hello Universe!"
    console.log(this.count); // 64
  }
}
```

### Component query
To simplify the step of querying elements from your root element, you can use
the `query` or `queryAll` injector like this:

```ts
import { component, query, queryAll } from  '@smoovy/composer';

@component('test')
class TestComponent {
  @query('.headline')
  private headline: HTMLElement;

  @queryAll('p', { parse: list => Array.from(list) })
  private paragraphs: HTMLElement[] = [];

  onCreate() {
    console.log(this.headline); // contains DOM element
    console.log(this.paragraphs); // contains array of DOM p elements
  }
}
```

## Service
A service is a class that exists as a singleton inside your project.
This "singleton functionality" is achieved by using injectors. So you
can inject services inside `components` and other `services`. A service
is basically a `Promise` with extra functionality.

```ts
import { Service } from '@smoovy/composer';

class TestService extends Service<any, TestService> {
  protected get child() {
    return TestService;
  }

  async init() {
    this.resolve(this.config.msg);
  }
}
```

### Creating sub services
A service can have children, so you can split the service into smaller ones
and give them a separate context. For example you have a `ScrollerService`.
Now you have a sidescroller which uses a different scroller, you could
create a sub service with a name and different configuration. This allows you
to create reusable components easier. Here's an example

```ts
const testService = new TestService({ msg: "I'm the parent" });

testService.addChild('sub1', { msg: "I'm the child" });

// now inside your components you can for the children
let message = '';

if (testService.hasChild('sub1')) {
  const sub1 = testService.getChild('sub1');
  message = await sub1;
} else {
  message = await testService;
}

// message will be "I'm the child"
console.log(message);
```

## Using a service
Services can be injected into components or other services like this:

```ts
import { service, component } from  '@smoovy/composer';

class TestService2 {
  @service(TestService)
  private testService: TestService;

  async init() {
    // make sure to check if it's been activated otherwise it would wait forever
    if (this.testService.activated) {
      await this.testService;
    }
  }
}

@component('[data-test]')
class TestComponent {
  @service(TestService, true /** await automatically **/)
  private message: string;

  onCreate() {
    // We'll get value immediately since we told
    // to await the service on injection
    console.log(this.message);
  }
}
```

## Composer
The composer glues components and services together. It manages injections,
configurations and "garbage collection". Composers are defined with a class
like this:

```ts
import { composer } from '@smoovy/composer';

@composer({
  services: [],
  components: []
})
class App {
  @composer()
  private composer!: Composer;

  onCreate() {
    console.log(this.composer);
  }
}

// Create the app to kick off initialization
new App();
```

### Using composer in components
You can inject the composer into child components and services like this:

```ts
import { component, composer } from  '@smoovy/composer';

@component('[data-test]')
class TestComponent {
  @composer()
  private composer: Composer;

  onCreate() {
    this.composer.update();
  }
}
```
> This also works for services

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).