# @smoovy/webgl
[![Version](https://flat.badgen.net/npm/v/@smoovy/webgl)](https://www.npmjs.com/package/@smoovy/webgl) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/webgl)

Small and flexible WebGL library with only the absolute basics: Camera, Mesh (incl. Plane), Shaders, Textures, Uniforms.

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

### Create a context
```js
const webgl = new WebGL();
```

### Meshes
This adds a plane in the center of the screen and manipulates it
```js
const plane = webgl.plane({
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  originX: 0.5,
  originY: 0.5,
  density: 10
});

// move plane
plane.x = 2;
plane.y = 2;
plane.z = 5;

// resize plane
plane.width = .5;
plane.height = .5;

// change origin
plane.originX = 0;
plane.originY = 0;
```

### Camera
A default perspective camera will be created automatically. You can access it via `wegbl.renderer.camera`. You can create mutliple cameras like this:

```js
const camera1 = webgl.camera({ fov: 30});
const camera2 = webgl.camera({ fov: 30, near: .5, far: 50 });
```

Render into a framebuffer texture:
```js
const cam1 = webgl.camera('cam1', { framebuffer: true });
webgl.plane({ textures: cam1.framebuffer.texture });
```

#### Assign a camera to a mesh
Meshes will fallback to the default camera. You can overwrite it with the `camera` option:

```js
webgl.plane({ ..., camera: camera1 });
webgl.plane({ ..., camera: camera2 });
```

### Uniforms
Uniforms are availbale on all meshes through the `uniforms` property.

```js
const plane = webgl.plane({
  ...,
  uniforms: {
    u_color: [ 0, 1, 0, 1 ] // make it red
  }
});

// change color to red
plane.uniforms.u_color[0] = 1;
plane.uniforms.u_color[1] = 0;
```

#### Uniform type detection
Types are mostly autodetected, but can be forced in cases of ambiguity (e.g. mat2 and vec4)

```js
const plane = webgl.plane({
  ...,
  uniforms: {
    // automatically converted to vec4
    // not defined in uniformTypes
    u_mat2: [0, 1, 2, 3]
  },
  uniformTypes: {
    // force mat2 type on `u_mat2` uniform
    u_mat2: 'm2'
  }
});
```

#### Optional uniforms
If WebGL can't find a uniform you'll get a warning in the console. To prevent this you can mark the uniform as optional and prevent warnings/errors.

```js
const plane = webgl.plane({
  ...,
  uniformOptionals: {
    // ignore warning and errros
    // if not defined in mesh
    u_color: true
  }
});
```

### Shaders
If no shaders are defined it will fall back to the default shader. You can override the default shader like this:

```js
const plane = webgl.plane({
  ...,
  vertex: `#version 300 es
    in vec4 a_position;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;

    void main() {
      gl_Position = u_proj * u_view * u_model * a_position;
    }`,
  fragment: `#version 300 es
    precision mediump float;

    out vec4 fragColor;
    uniform vec4 u_color;

    void main() {
      fragColor = u_color;
    }`
});
```

### Textures
Image and video textures are supported out-of-the-box. and can be created like this:

```js
webgl.image({ src: '/path/to/image.jpg' });
webgl.video({ src: '/path/to/video.mp4' });

// extended configuration
webgl.image({
  unpackFlip: false,
  minFilter: webgl.ctx.LINEAR,
  wrapS: webgl.ctx.CLAMP_TO_EDGE,
  wrapT: webgl.ctx.CLAMP_TO_EDGE,
})
```

#### Attach to meshes

You can just pass the texture to the mesh via `texture`:
```js
const plane = webgl.plane({
  ...,
  textures: webgl.image({ src: '/path/to/image.jpg' })
});
```
> This will be named to `u_texture` in the fragment shader.

You can attach multiple textures to one mesh like this:
```js
const plane = webgl.plane({
  ...,
  textures: {
    base: webgl.image({ src: '/path/to/image.jpg' }),
    depth: webgl.image({ src: '/path/to/depth.png' })
  }
});
```
> All textures will be prefixed with `u_texture_`. So `base` will be `u_texture_base` for example.

#### Preloading image textures
Preloading textures can be done by either creating the texture, which will immediately load it or preload the image first like this:

```js
import { TextureMediaLoader } from '@smoovy/webgl';

TextureMediaLoader.load('/path/to/image.jpg');
```
> This will load the image into the media cache and used when a texture requests it.

### Screen Coordinate Mapping
Usually coordinates (x,y) and sizes of meshes are provided in clips space coordinates. You can use `screen` on meshes to map screen coordinats (px) to clip space coordinates automatically.

```js
const plane = webgl.plane({
  x: 500,
  y: 500,
  width: 100,
  height: 100,

  // this will convert x, y, width and height to
  // clip space before passing them to the shader
  // program. It'll render a 100x100px square at
  // the position (500, 500).
  screen: true
});

// all following transformations will be
// converted as well automatically
plane.x = 100;
plane.y = 100;
plane.width = 300;
plane.height = 300;
```
> Important: The z-coordinate will not be converted to px values and will always be in clip space

#### Manually convert values
Converting the coordinates happens through the camera. With these methods you can convert px to clip space coordinates and sizes
```js
camera.ch(100) // -> 100px height to clip space
camera.cw(100) // -> 100px width to clip space
camera.cx(100) // -> 100px on the x-axis
camera.cy(100) // -> 100px on the y-axis
```

#### Scrolling
With this method you can basically apply "scrolling" by moving the camera with this conversion like this:

```js
window.onscroll = () => {
  camera.x = camera.cw(window.scrollX);
  camera.y = camera.ch(window.scrollY);
};
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).