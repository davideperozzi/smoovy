import { WebGL } from '../src';

const webgl = new WebGL();

function updateScroll() {
  webgl.scrollTo({ x: window.scrollX, y: window.scrollY });
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

pauseCheck();
setInterval(pauseCheck, 2000);

webgl.plane({
  element: document.querySelector('#box') as HTMLElement,
  segments: 50,
  vertex: `
    precision mediump float;

    attribute vec4 vertCoord;
    attribute vec2 texCoord;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;

    varying vec4 vCoord;

    void main() {
      vCoord = vertCoord;

      vCoord.z = sin(vertCoord.x + vertCoord.y + time);

      gl_Position = projectionMatrix * modelViewMatrix * vCoord;
    }

  `,
  fragment: `
    precision mediump float;

    varying vec4 vCoord;
    uniform float time;

    float mapRange(float value, float inStart, float inEnd, float outMin, float outMax) {
      return outMin + (outMax - outMin) / (inEnd - inStart) * (value - inStart);
    }

    void main() {
      vec4 coords = vCoord;
      vec4 color = vec4(5.0 / 255.0, 28.0 / 255.0, 44.0 / 255.0, 1.0);

      color.a = vCoord.z;

      gl_FragColor = color;
    }
  `,
}, (plane) => {
  plane.uniform('color', [ 133, 7, 0 ]);
});

const image = webgl.image({
  source: 'https://i.imgur.com/fHyEMsl.jpg',
  element: document.querySelector('#test-attach') as HTMLElement,
});
