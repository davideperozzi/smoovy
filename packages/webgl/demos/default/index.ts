import { WebGL } from '../../src';


const webgl = new WebGL({ canvas: '#test'  });

webgl.scrollTo({ y: 0 });
webgl.setSize(1920, 1080);
webgl.render();
webgl.pause(true);

webgl.clipSpaceW(300);
webgl.clipSpaceH(500);

const image = new WebGLImage({
  source: './images/test.png',
  position: { x: 0, y: 0 }, // default: { x: 0, y: 0 }
  size: { width: 300, height: 400 }, // default: auto
  segments: 15, // default: 15
  vertex: `shader-code`,
  fragment: `shader-code`
});

webgl.add(image);

const image = webgl.image('./images/test.png')
  .shader(`fragment-code`, `vertex-code`)
  .segments(15)
  .position(0, 0)
  .uniform('amplitude', 1.0)
  .uniform({
    frequency: 3,
    speed: { x: 0, y: 0 }
  });

image.uniforms.frequency // { value: 3 }

webgl.add(image);
webgl.remove(image);





