# @smoovy/webgl
[![Version](https://flat.badgen.net/npm/v/@smoovy/webgl)](https://www.npmjs.com/package/@smoovy/webgl) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/webgl)

Easy WebGL handler to connect the DOM with your WebGL scene and more.

## Installation
```sh
yarn add @smoovy/webgl
```
or
```sh
npm install --save @smoovy/webgl
```

## Usage
Import the `WebGL` class as usual:
```js
import { WebGL } from '@smoovy/webgl';
```

### Create a simple WebGL scenes
To create the canvas and the default scene use the following commands:

```js
const webgl = new WebGL();
```

This will setup the canvas element as background element. If you don't want this you can disable it via the options:

```js
const webgl = new WebGL({
  canvas: document.querySelector('#custom-canvas'),

  // disable automatic styles
  // (e.g. positon fixed etc.) being
  // applied on the canvas
  fullscreen: false
})
```

### Create a simple object
This library comes with the following out-of-the-box objects: `Plane`, `Image` and `Video`. To create a new object in your scene, simply call the following function

```js
// creating a blue plane
webgl.plane({
  x: 200,
  y: 400,
  width: 300,
  height: 300,
}, (plane) => {
  plane.uniform('color', [0, 255, 0]);
});

// creating a simple image
webgl.image({
  source: './path/to/your/image.jpg',
  x: 300,
  y: 500
  // will be detect automatically
  // width: 300,
  // height: 500
});

// creating a simple video
webgl.video({
  source: docuemnt.querySelector('video'),
  x: 300,
  y: 500,
  width: 500,
  height: 500
});
```

### Connecting an objec to the DOM
If you want to sync the position and size of a DOM element with your object in a scene, just use the following option

```js
webgl.plane({
  element: document.querySelector('#custom-el')
});
```
> This also works for `.image()` and `.video()`


### Use custom shaders
To use custom shaders just mention them in the config and the program will take care of it

```js
webgl.plane({
  element: document.querySelector('#custom-el'),
  vertex: `
    attribute vec4 vertCoord;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vertCoord;
    }
  `,
  fragment: `
    precision highp float;
    uniform vec3 color;

    void main() {
      gl_FragColor = vec4(
        color.r / 255.0,
        color.g / 255.0,
        color.b / 255.0,
        1.0
      );
    }
  `
});
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
