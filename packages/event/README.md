# @smoovy/event
[![Version](https://flat.badgen.net/npm/v/@smoovy/event)](https://www.npmjs.com/package/@smoovy/event) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/event)


## Installation
```sh
npm install --save @smoovy/event
```

## The Event emitter
Import the emitter as usual:
```js
import { EventEmitter } from '@smoovy/event';
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
import { listenCompose } from '@smoovy/event';

const unlisten = listenCompose(
  emitter.on('eventName1', () => {}),
  emitter.on('eventName2', () => {}),
  emitter.on('eventName3', () => {})
);

// Easily unsubcribe from all simultaneously
unlisten();
```
> `listenCompose` simply merges all "unsubscribe callbacks" into one

### Intercepting/Transforming values from listeners
This special functionality handles your listeners/emissions differently. You can simply pass a callback function to your emission in order to receive the corresponding return values from the listeners for the emitted event:

```js
emitter.on('eventName1', ({ x, y }) => {
  return {
    x: Math.max(x, 0),
    y: Math.max(y, 0)
  }
});

emitter.emit(
  'eventName1',
  { x: 10, y: -10 },
  (data) => {
    // This will be called everytime a listener was called
    // The `data` will be: { x: 10, y: 0 }
  }
);
```
> This can be useful if you want to let a user make some transformations to the emitted data

> **Attention:** This can get difficult to maintain and debug quickly, so use it wisely!

### Mute/Unmute events
You can simply mute events by telling the emitter:

```js
const unmute = emitter.muteEvents(
  'eventName1',
  'eventName2',
  'eventName3'
);

emitter.emit('eventName1', 'Yo?') // Will be dismissed
unmute();
emitter.emit('eventName1', 'Yo!') // Goes through
```

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
