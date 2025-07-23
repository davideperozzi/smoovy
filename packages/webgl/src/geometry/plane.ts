import { Coordinate, isDef, isNum, isObj, isStr, mapRange } from '@smoovy/utils';
import { Camera } from '../camera';

import { Mesh, MeshConfig } from '../mesh';
import colorShader from '../shaders/color.glsl';
import textureShader from '../shaders/texture.glsl';
import { Texture } from '../texture';
import { triangulate } from '../utils';

export interface PlaneConfig extends MeshConfig {
  width?: number;
  height?: number;
  originX?: number;
  originY?: number;
  density?: number | Coordinate;
}

export class Plane<C extends PlaneConfig = PlaneConfig> extends Mesh<C> {
  constructor(
    protected gl: WebGLRenderingContext,
    config: C
  ) {
    const uniforms = config.uniforms || {};

    if (!isDef(uniforms.u_color)) {
      uniforms.u_color = [0, 0, 0, 1];
    }

    if (!isDef(uniforms.u_alpha)) {
      uniforms.u_alpha = 1;
    }

    super(gl, {
      vertex: config.texture ? textureShader.vertex : colorShader.vertex,
      fragment: config.texture ? textureShader.fragment : colorShader.fragment,
      ...config,
      uniforms,
      uniformOptionals: {
        u_color: true,
        u_alpha: true,
        ...(config.uniformOptionals || {}),
      }
    });

    this.updateGeometry();
  }

  set originX(origin: number) {
    this.config.originX = origin;
    this.x = this.rawPosition.x;
  }

  get originX() {
    const { originX } = this.config;

    return isNum(originX) ? originX : .5;
  }

  set originY(origin: number) {
    this.config.originY = origin;
    this.y = this.rawPosition.y;
  }

  get originY() {
    const { originY } = this.config;

    return isNum(originY) ? originY : .5;
  }

  get centerX() {
    const { screen, width } = this.config;
    let origin = mapRange(this.originX, 0, 1, -0.5, 0.5);

    if (screen) {
      origin *= -1;
    }

    return (width || 0) * origin;
  }

  get centerY() {
    return (this.config.height || 0) * mapRange(this.originY, 0, 1, 0.5, -0.5);
  }

  get density() {
    const { density } = this.config;

    return typeof density === 'number'
      ? { x: density, y: density }
      : density || { x: 1, y: 1  }
  }

  get transparent() {
    const texture = this.config.texture;

    if (texture instanceof Camera) {
      return false;
    }

    if (typeof super.transparent == "boolean") {
      return super.transparent;
    }

    if (texture instanceof Texture) {
      return !!texture.transparent;
    }

    if (isObj(texture)) {
      return !!Object.values(texture).find(tex => {
        if (tex instanceof Camera) {
          return false;
        }

        return tex.transparent;
      });
    }

    return false;
  }

  set width(width: number) {
    if (this.config.width !== width) {
      this.config.width = width;

      this.updateGeometry();
    }
  }

  get width() {
    const width = this.config.width;

    if (this.config.screen) {
      return this.camera ? this.camera.cw(width || 0) : 0;
    }

    return isNum(width) ? width : 1;
  }

  set height(height: number) {
    if (this.config.height !== height) {
      this.config.height = height;

      this.updateGeometry();
    }
  }

  get height() {
    const height = this.config.height;

    if (this.config.screen) {
      return this.camera ? this.camera.ch(height || 0) : 0;
    }

    return isNum(height) ? height : 1;
  }

  private scaleVertices(verts: Float32Array, width: number, height: number) {
    for (let i = 0, len = verts.length; i < len; i += 18) {
      verts[i] *= width; verts[i + 1] *= height;
      verts[i + 3] *= width; verts[i + 4] *= height;
      verts[i + 6] *= width; verts[i + 7] *= height;
      verts[i + 9] *= width; verts[i + 10] *= height;
      verts[i + 12] *= width; verts[i + 13] *= height;
      verts[i + 15] *= width; verts[i + 16] *= height;
    }

    return verts;
  }

  private parseNormals(verts: Float32Array) {
    for (let i = 0, len = verts.length; i < len; i += 18) {
      verts[i] = 0; verts[i + 1] = 0; verts[i + 2] = 1;
      verts[i + 3] = 0; verts[i + 4] = 0; verts[i + 5] = 1;
      verts[i + 6] = 0; verts[i + 7] = 0; verts[i + 8] = 1;
      verts[i + 9] = 0; verts[i + 10] = 0; verts[i + 11] = 1;
      verts[i + 12] = 0; verts[i + 13] = 0; verts[i + 14] = 1;
      verts[i + 15] = 0; verts[i + 16] = 0; verts[i + 17] = 1;
    }

    return verts;
  }

  updateGeometry() {
    super.updateGeometry();

    if (this.width === 0 || this.height === 0) {
      return;
    }

    const program = this.program;
    const vertices = triangulate(this.density);

    program.setPositions(this.scaleVertices(vertices, this.width, this.height));
    program.setNormals(this.parseNormals(new Float32Array(vertices)));

    if (this.config.texture) {
      // Set the size to 3 instead of 2, so we can just us the triangulate function
      // WebGL will strip away the Z value when it reaches the shader, which is
      // irrelevant for uvs anyway. Alternatively create a new Flaot32Array with
      // the z value removed
      program.setTextureCoords(triangulate(this.density, false), 3);
    }
  }

  beforeDraw() {
    this.program.uniform('u_plane', [this.width, this.height], 'v2', false);
  }
}