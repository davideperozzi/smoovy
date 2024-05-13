# @smoovy/emitter
[![Version](https://flat.badgen.net/npm/v/@smoovy/emitter)](https://www.npmjs.com/package/@smoovy/emitter) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/emitter)

## Installation
```sh
yarn add @smoovy/emitter
```
or
```sh
npm install --save @smoovy/emitter
```

## The event emitter
Import the emitter as usual:
```js
import { EventEmitter } from '@smoovy/emitter';
```

### Usage
To use the event emitter you can either create a new instance directly or use it as a parent class.

```js
const emitter = new EventEmitter();
// or
class UltraFancyEmitter extends EventEmitter {}
```

### Emitting events
You have multiple options when it comes to the emission of events:

```js
// Emit a single value
emitter.emit('eventName', 'A random string');

// Emit an other data type (object)
emitter.emit('eventName', { name: 'Mistadobalina' });

// Emit multiple events with different data types
emitter.emit({
  eventName1: 'Some data',
  eventName2: [ 1, 2, 3, 4 ]
});
```

### Listening/Unlistening for events
Listening to events is pretty simple:

```js
emitter.on('eventName', (data) => {
  // Handle your data
});
```

To unlisten you have two options:
```js
const listener = (data) => {};
const unlisten = emitter.on('eventName', listener);

// Unlisten from callback or...
unlisten();

// Unlisten the old-fashioned way
emitter.off('eventName', listener);
```

When you have many listeners going wild in your application, you can use this litte helper function to stack those:

```js
import { listenCompose } from '@smoovy/listener';

const unlisten = listenCompose(
  emitter.on('eventName1', () => {}),
  emitter.on('eventName2', () => {}),
  emitter.on('eventName3', () => {})
);

// Easily unsubcribe from all simultaneously
unlisten();
```
> `listenCompose` simply merges all "unsubscribe callbacks" into one

### Reflecting events
Reflect events to a different emitter. Muted events will not be reflects:
```js
const reflectedEmitter = new Emitter();

// Reflect events to reflectedEmitter
emitter.reflectEvents(reflectedEmitter);

// Listen for events
reflectedEmitter.on('eventName1', (msg) => console.log(msg));

// Dispatch event in base emitter
emitter.emit('eventName1', 'reflected'); // Displays 'reflected'

// Remove reflected emitters
emitter.unreflectEvents();
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).