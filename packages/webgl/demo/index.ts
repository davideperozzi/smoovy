import { WebGL } from '../src';

const src = '/1000x1000.jpg';
const gl = new WebGL();
const camera = gl.renderer.camera;
const plane1 = gl.plane({
  x: 0,
  y: 500,
  width: 500,
  height: 500,
  originX: 0.5,
  originY: 0.5,
  screen: true,
  texture: gl.image({ src }),
});

const plane2 = gl.plane({
  x: 0,
  y: 1000,
  width: 500,
  height: 500,
  originX: 0.5,
  originY: 0.5,
  screen: true,
  texture: gl.video({ src: '/meltdown.mp4' }),
});

gl.ctx.disable(gl.ctx.CULL_FACE);

setTimeout(() => {
  function render(time: number) {
    // plane1.originX = Math.cos(time * .001);
    // plane1.originY = Math.sin(time * .001);

    camera.y = camera.ch(window.scrollY);

    requestAnimationFrame(render);
  }

  render(0);
}, 100);

let lastX = window.scrollX;
let lastY = window.scrollY;

window.history.scrollRestoration = 'manual';

const handleScroll = () => {
  const x = window.scrollX;
  const y = window.scrollY;

  camera.y = camera.ch(window.scrollY);

  // camera.updateModel();
  // camera.y = camera.ch(y);

  // camera.projection[13] = camera.ch(y);

  lastX = x;
  lastY = y;
}

window.onscroll = () => handleScroll();
handleScroll();
// // settings uniforms
// gl.uniforms.mouse = [ 0.5, 0.5 ];

// // creating a texture
// const texture1 = gl.image({ source: 'https://picsum.photos/500/500' });
// const texture2 = gl.video({ source: 'https://www.w3schools.com/html/mov_bbb.mp4' });
// // const fbo1 = gl.fbo();

// // adding a plane
// const plane = gl.plane({
//   x: 100,
//   y: 100,
//   width: 500,
//   height: 500,
//   density: 1000,
//   textures: {
//     image: texture1,
//     video: texture2
//   },
//   uniforms: {
//     color: [ 1, 0, 0, 1 ]
//   }
// });

// plane.uniforms.color = [ 0, 0, 1, 1 ];

// // plane that covers the screen
const viewportPlane = gl.plane({
  x: 100,
  y: 100,
  width: window.innerWidth * .5,
  height: window.innerHeight * .5,
  screen: true,
  uniforms: {
    u_color: [ 0, 0, 1, 0.0 ]
  }
});

window.addEventListener('scroll', () => {
  viewportPlane.y = 100 + window.scrollY;
  viewportPlane.uniforms.u_color[3] = Math.min(window.scrollY / window.innerHeight, 1);
  viewportPlane.uniforms.u_color[1] = Math.min((window.scrollY - window.innerHeight) / window.innerHeight, 1);
});