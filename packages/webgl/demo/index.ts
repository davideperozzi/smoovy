import { GLImage, GLImageEvent, GLMeshEvent, WebGL } from '../src';
import { Pane } from 'tweakpane';
import { mat4tv } from '../src/utils/math';

const webgl = new WebGL();
const pane = new Pane();

function updateScroll() {
  webgl.scrollTo({ x: window.scrollX, y: window.scrollY });

  const conatiner = webgl.getContainer('test');

  if (container) {
    container.scrollTo({ x: window.scrollX, y: window.scrollY * .5 });
  }
}

window.addEventListener('scroll', updateScroll);
setTimeout(() => updateScroll());

const pauseCheck = () => {
  setTimeout(() => {
    for (let i = 0; i < 500; i++) {
      requestAnimationFrame(() => webgl.pause(true));
      // webgl.render();
    }
  }, 500);
  setTimeout(() => {
    for (let i = 0; i < 500; i++) {
      requestAnimationFrame(() => webgl.pause(false));
      // webgl.render();
    }
  }, 1000);
  // setTimeout(() => webgl.pause(true), 1500);
  // setTimeout(() => webgl.pause(false), 2000);
}

// pauseCheck();
// setInterval(pauseCheck, 2000);

const plane = webgl.plane({
  element: document.querySelector('#box') as HTMLElement,
  vertex: /* glsl */`
    precision mediump float;
//
    attribute vec4 vertCoord;
    attribute vec2 texCoord;
//
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;
//
    varying vec4 vCoord;
//
    void main() {
      vCoord = vertCoord;
//
      // vCoord.z = sin(vertCoord.x + vertCoord.y + time) * .5;
//
      gl_Position = projectionMatrix * modelViewMatrix * vCoord;
    }
//
  `,
  fragment: /* glsl */`
    precision mediump float;
//
    varying vec4 vCoord;
    uniform float time;
//
    float mapRange(float value, float inStart, float inEnd, float outMin, float outMax) {
      return outMin + (outMax - outMin) / (inEnd - inStart) * (value - inStart);
    }
//
    void main() {
      vec4 coords = vCoord;
      vec4 color = vec4(5.0 / 255.0, 28.0 / 255.0, 44.0 / 255.0, 1.0);
//
      // color.a = vCoord.z;
//
      gl_FragColor = color;
    }
  `,
}, (plane) => {
  plane.uniform('color', [ 133, 7, 0 ]);
});

const scale = { value: 0, scaleOrigin: 0, translateOrigin: 0, translate: { x: 200, y: 200 } };

pane.addInput(scale, 'value', { min: 1, max: 2 }).on('change', (ev) => {
  plane.scale(scale.value);
});

pane.addInput(scale, 'scaleOrigin', { min: 0, max: 1 }).on('change', (ev) => {
  plane.setScaleOrigin(scale.scaleOrigin);
});

pane.addInput(scale, 'translateOrigin', { min: 0, max: 1 }).on('change', (ev) => {
  plane.setTranslateOrigin(scale.translateOrigin);
});

pane.addInput(scale, 'translate', {
  picker: 'inline',
  expanded: true,
}).on('change', (ev) => {
  plane.translate({ x: scale.translate.x, y: scale.translate.y });
});

pane.controller_.view.element.style.zIndex = '1000';
pane.controller_.view.element.style.position = 'fixed';

// plane.scale(1, 1);

// GLImage.preload(webgl.gl, 'https://i.imgur.com/fHyEMsl.jpg', true);
const dimage = webgl.image({
  source: 'https://picsum.photos/800/600',
  container: 'test',
  x: 500,
  y: 500
});

dimage.on(GLMeshEvent.BEFORE_DRAW, () => {
  webgl.gl.disable(webgl.gl.CULL_FACE);
});

dimage.on(GLMeshEvent.AFTER_DRAW, () => {
  webgl.gl.enable(webgl.gl.CULL_FACE);
});

dimage.loadTexture('image1', 'https://picsum.photos/536/354');

const container = webgl.container({ name: 'test' });


const createImage = () => webgl.image({
  source: 'https://picsum.photos/536/354',
  element: document.querySelector('#test-attach') as HTMLElement
});

const image = createImage();

image.setScaleOrigin(0.5);

setTimeout(() => {
  image.scale(1.5);
}, 1000);


// generate a random image url
const randomImage = () => `https://picsum.photos/seed/${Math.random()}/200/200`;

setTimeout(async () => {
  image.setSource('https://images.unsplash.com/photo-1674753987419-750e44ba94e2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3NTk1ODU1MQ&ixlib=rb-4.0.3&q=80&w=800');
}, 1000);

setTimeout(() =>  {
  webgl.remove(image);

  setTimeout(() => {
    const image = createImage();

    setTimeout(() => {
      image.setSource('https://images.unsplash.com/photo-1674753987419-750e44ba94e2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3NTk1ODU1MQ&ixlib=rb-4.0.3&q=80&w=800');
    }, 3000);

    setTimeout(() => webgl.remove(image), 4500);
  }, 2000);
}, 3000);

const background = webgl.plane({
  element: document.body
}, (plane) => {
  plane.uniform('color', [133, 13, 30]);
});
mat4tv(background.model, { z: 0.01 });
