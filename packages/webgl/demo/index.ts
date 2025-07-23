import { WebGL } from '../src/index';

const src = '/1000x1000.jpg';
const gl = new WebGL();
const c1 = gl.camera({
  fbo: true,
  name: 'fbo',
  scopes: ['fbo'],
});

const p1 = gl.plane({
  x: 0,
  y: 0,
  width: 2,
  height: 2,
  density: 100,
  uniforms: { u_color: [0,0,0,1] },
  scopes: ['fbo'],
});

//
//const p2 = gl.plane({
//  x: 0,
//  y: 0,
//  width: 1,
//  height: 1,
//  camera: c1,
//  uniforms: { u_color: [0,1,0,1] }
//});
//
//const p3 = gl.plane({
//  x: 1,
//  y: 0,
//  width: 1,
//  height: 1,
//  camera: c1,
//  uniforms: { u_color: [0,0,1,1] }
//})

const p0 = gl.plane({
  x: window.innerWidth*.5,
  y: window.innerHeight*.5,
  screen: true,
  density: 50,
  width: window.innerWidth*.5,
  height: window.innerHeight*.5,
  uniforms: { u_color: [1,0,0,1] },
  //camera: c1,
  //texture: gl.image({ src }),
  //texture: c1,
  vertex: `#version 300 es
    precision mediump float;

    in vec4 a_position;
    in vec2 a_texcoord;
    uniform float u_time;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;

    out vec2 v_texcoord;
    out vec3 v_normal;

    void main() {
      v_texcoord = a_texcoord;

      vec4 pos = a_position;

      pos.z = cos(pos.x*5.5 + u_time)*.2;

      gl_Position = u_proj * u_view * u_model *  pos;
    }`
});
//
//window.onresize = () => {
//  p0.x = window.innerWidth*.5;
//  p0.y = window.innerHeight*.5;
//  p0.width = window.innerWidth*.5;
//  p0.height = window.innerHeight*.5;
//}
//
//const camera = gl.renderer.camera;
//
//gl.ctx.disable(gl.ctx.CULL_FACE);
//gl.ctx.enable(gl.ctx.DEPTH_TEST);
//
//const light = gl.plane({
//  width: 40,
//  height: 40,
//  screen: true,
//});
//
////const plane1 = gl.plane({
////  x: 0,
////  y: 0,
////  density: 30,
////  width: 1,
////  height: 1,
////  vertex: lightVertex,
////  fragment: lightFragment,
////  uniforms: { u_light: light.position }
////});
//
//const plane5 = gl.plane({
//  x: window.innerWidth/2,
//  y: window.innerHeight/2,
//  screen: true,
//  width: 500,
//  height: 500,
//  z: 0.1,
//  texture: gl.image({ src, transparent: true }),
//  uniforms: {
//    u_alpha: 0.8,
//  }
//})
//
//const plane6 = gl.plane({
//  x: window.innerWidth/2,
//  y: window.innerHeight/2,
//  screen: true,
//  width: 300,
//  height: 300,
//})
//
//const mouse = { x: 0, y: 0, z: 0 };
//
//function render(time: number) {
//  //plane1.rotationX = Math.sin(time * 0.001) * -1;
//
//  light.x = mouse.x;
//  light.y = mouse.y;
//  light.z = mouse.z;
//
//  requestAnimationFrame(render);
//}
//
//window.onmousemove = (event) => {
//  mouse.x = event.clientX;
//  mouse.y = event.clientY;
//}
//
//window.onwheel = (event) => {
//  //mouse.z += event.deltaY * 0.01;
//}
//
//requestAnimationFrame(render);
//
// const plane2 = gl.plane({
//   x: 0,
//   y: 1000,
//   width: 500,
//   height: 500,
//   originX: 0,
//   originY: 0,
//   screen: true,
//   texture: gl.video({ src: '/meltdown.mp4' }),
// });
//
// gl.ctx.disable(gl.ctx.CULL_FACE);
//
// setTimeout(() => {
//   function render(time: number) {
//     // plane1.originX = Math.cos(time * .001);
//     // plane2.y = Math.sin(time * .001);
//
//     plane2.width = Math.sin(time * 0.001) * 500;
//     camera.y = camera.ch(window.scrollY);
//
//     requestAnimationFrame(render);
//   }
//
//   render(0);
// }, 100);
//
// let lastX = window.scrollX;
// let lastY = window.scrollY;
//
// window.history.scrollRestoration = 'manual';
//
// const handleScroll = () => {
//   const x = window.scrollX;
//   const y = window.scrollY;
//
//   camera.y = camera.ch(window.scrollY);
//
//   // camera.updateModel();
//   // camera.y = camera.ch(y);
//
//   // camera.projection[13] = camera.ch(y);
//
//   lastX = x;
//   lastY = y;
// }
////
// window.onscroll = () => handleScroll();
// handleScroll();
//// // // settings uniforms
//// // gl.uniforms.mouse = [ 0.5, 0.5 ];
////
//// // // creating a texture
//// // const texture1 = gl.image({ source: 'https://picsum.photos/500/500' });
//// // const texture2 = gl.video({ source: 'https://www.w3schools.com/html/mov_bbb.mp4' });
//// // // const fbo1 = gl.fbo();
////
//// // // adding a plane
//// // const plane = gl.plane({
//// //   x: 100,
//// //   y: 100,
//// //   width: 500,
//// //   height: 500,
//// //   density: 1000,
//// //   textures: {
//// //     image: texture1,
//// //     video: texture2
//// //   },
//// //   uniforms: {
//// //     color: [ 1, 0, 0, 1 ]
//// //   }
//// // });
////
//// // plane.uniforms.color = [ 0, 0, 1, 1 ];
////
//// // // plane that covers the screen
//// const viewportPlane = gl.plane({
////   x: 100,
////   y: 100,
////   width: window.innerWidth * .5,
////   height: window.innerHeight * .5,
////   screen: true,
////   uniforms: {
////     u_color: [ 0, 0, 1, 0.0 ]
////   }
//// });
////
//// window.addEventListener('scroll', () => {
////   viewportPlane.y = 100 + window.scrollY;
////   viewportPlane.uniforms.u_color[3] = Math.min(window.scrollY / window.innerHeight, 1);
////   viewportPlane.uniforms.u_color[1] = Math.min((window.scrollY - window.innerHeight) / window.innerHeight, 1);
//// });