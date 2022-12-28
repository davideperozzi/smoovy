# @smoovy/listener
[![Version](https://flat.badgen.net/npm/v/@smoovy/listener)](https://www.npmjs.com/package/@smoovy/listener) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/listener)

Very simple subscribe/unsubscribe system.

## Installation
```sh
yarn add @smoovy/listener
```
or
```
npm install --save @smoovy/listener
```

## Usage
Listen to elements

```js
import { listen } from '@smoovy/listener';

// single type
listen(window, 'mousemove', event => console.log(event));

// multi type
listen(document.body, ['mouseup', 'mousecancel'], event => console.log(event));
```

Unlistening from events

```js
const unlisten = listen(window, 'mousemove', event => console.log(event));

// to unlisten from window mousemove simply call the unlisten function
unlisten();
```

In case you have many listeners and want to unsubscribe/unlisten from all at once,
you can use the `listenCompose` helper function:

```js
import { listen, listenCompose } from '@smoovy/listener';

const unlisten = listenCompose(
  listen(window, 'mousemove', event => console.log(event)),
  listen(window, 'click', event => console.log(event)),

  // custom callback on unlisten
  () => console.log('all listeners are now inactive')
);

unlisten();
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
