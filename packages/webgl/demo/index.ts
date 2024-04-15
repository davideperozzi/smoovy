import { WebGL } from '../src/index';
import { mapRange } from '../../utils/src/math.ts';
import lightVertex from './shaders/light.vert.glsl';
import lightFragment from './shaders/light.frag.glsl';

const src = '/1000x1000.jpg';
const gl = new WebGL({ uniforms: { u_color1: [0, 1, 0, 1] }  });
const camera = gl.renderer.camera;

gl.ctx.disable(gl.ctx.CULL_FACE);
gl.ctx.enable(gl.ctx.DEPTH_TEST);

const light = gl.plane({
  width: 40,
  height: 40,
  screen: true,
});

const plane1 = gl.plane({
  x: 0,
  y: 0,
  density: 30,
  width: 1,
  height: 1,
  vertex: lightVertex,
  fragment: lightFragment,
  uniforms: { u_light: light.position }
});

const mouse = { x: 0, y: 0, z: 0 };

function render(time: number) {
  //plane1.rotationX = Math.sin(time * 0.001) * -1;

  light.x = mouse.x;
  light.y = mouse.y;
  light.z = mouse.z;

  requestAnimationFrame(render);
}

window.onmousemove = (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

window.onwheel = (event) => {
  mouse.z += event.deltaY * 0.01;
}

requestAnimationFrame(render);

 const plane2 = gl.plane({
   x: 0,
   y: 1000,
   width: 500,
   height: 500,
   originX: 0,
   originY: 0,
   screen: true,
   texture: gl.video({ src: '/meltdown.mp4' }),
 });

 gl.ctx.disable(gl.ctx.CULL_FACE);

 setTimeout(() => {
   function render(time: number) {
     // plane1.originX = Math.cos(time * .001);
     // plane2.y = Math.sin(time * .001);

     plane2.width = Math.sin(time * 0.001) * 500;

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
//
 window.onscroll = () => handleScroll();
 handleScroll();
// // // settings uniforms
// // gl.uniforms.mouse = [ 0.5, 0.5 ];
//
// // // creating a texture
// // const texture1 = gl.image({ source: 'https://picsum.photos/500/500' });
// // const texture2 = gl.video({ source: 'https://www.w3schools.com/html/mov_bbb.mp4' });
// // // const fbo1 = gl.fbo();
//
// // // adding a plane
// // const plane = gl.plane({
// //   x: 100,
// //   y: 100,
// //   width: 500,
// //   height: 500,
// //   density: 1000,
// //   textures: {
// //     image: texture1,
// //     video: texture2
// //   },
// //   uniforms: {
// //     color: [ 1, 0, 0, 1 ]
// //   }
// // });
//
// // plane.uniforms.color = [ 0, 0, 1, 1 ];
//
// // // plane that covers the screen
// const viewportPlane = gl.plane({
//   x: 100,
//   y: 100,
//   width: window.innerWidth * .5,
//   height: window.innerHeight * .5,
//   screen: true,
//   uniforms: {
//     u_color: [ 0, 0, 1, 0.0 ]
//   }
// });
//
// window.addEventListener('scroll', () => {
//   viewportPlane.y = 100 + window.scrollY;
//   viewportPlane.uniforms.u_color[3] = Math.min(window.scrollY / window.innerHeight, 1);
//   viewportPlane.uniforms.u_color[1] = Math.min((window.scrollY - window.innerHeight) / window.innerHeight, 1);
// });