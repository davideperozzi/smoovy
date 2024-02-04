import type { Coordinate } from '@smoovy/utils';

import { Mesh, MeshConfig } from '../mesh';
import colorShader from '../shaders/color.glsl';
import textureShader from '../shaders/texture.glsl';
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
    super(gl, {
      vertex: config.texture ? textureShader.vertex : colorShader.vertex,
      fragment: config.texture ? textureShader.fragment : colorShader.fragment,
      ...config,
      uniforms: {
        u_color: [ 1, 0, 0, 1 ],
        u_alpha: 1,
        ...(config.uniforms || {}),
      },
      uniformOptionals: {
        u_color: true,
        u_alpha: true,
        ...(config.uniformOptionals || {}),
      }
    });
  }

  set originX(origin: number) {
    this.config.originX = origin;
    this.x = this.rawPosition.x;
  }

  get originX() {
    const { originX } = this.config;

    return typeof originX === 'number' ? originX : .5;
  }

  set originY(origin: number) {
    this.config.originY = origin;
    this.y = this.rawPosition.y;
  }

  get originY() {
    const { originY } = this.config;

    return typeof originY === 'number' ? originY : .5;
  }

  get centerX() {
    return (this.config.width || 0) * this.originX;
  }

  get centerY() {
    return (this.config.height || 0) * this.originY;
  }

  get density() {
    const { density } = this.config;

    return typeof density === 'number'
      ? { x: density, y: density }
      : density || { x: 1, y: 1  }
  }

  set width(width: number) {
    this.config.width = width;

    this.updateGeometry();
  }

  get width() {
    const width = this.config.width;

    if (this.config.screen) {
      return this.camera.cw(width || 0);
    }

    return typeof width === 'number' ? width : 1;
  }

  set height(height: number) {
    this.config.height = height;

    this.updateGeometry();
  }

  get height() {
    const height = this.config.height;

    if (this.config.screen) {
      return this.camera.ch(height || 0);
    }

    return typeof height === 'number' ? height : 1;
  }

  private scaleVertices(verts: Float32Array, width: number, height: number) {
    for (let i = 0, len = verts.length; i < len; i += 12) {
      verts[i] *= width; verts[i + 1] *= height;
      verts[i + 2] *= width; verts[i + 3] *= height;
      verts[i + 4] *= width; verts[i + 5] *= height;
      verts[i + 6] *= width; verts[i + 7] *= height;
      verts[i + 8] *= width; verts[i + 9] *= height;
      verts[i + 10] *= width; verts[i + 11] *= height;
    }

    return verts;
  }

  updateGeometry() {
    super.updateGeometry();

    this.program.attribute(
      'a_position',
      this.scaleVertices(triangulate(this.density), this.width, this.height),
      2
    );

    if (this.config.texture) {
      this.program.attribute(
        'a_texcoord',
        triangulate(this.density, false),
        2,
        0
      );
    }
  }

  beforeDraw() {
    this.program.uniform('u_plane', [this.width, this.height], 'v2', false);
  }
}