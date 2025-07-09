import { mapRange, Size } from '@smoovy/utils';

import { Framebuffer, FramebufferConfig } from './framebuffer';
import { FramebufferTexture } from './texture';

import { Mat4, mat4, mat4p } from './math';
import { Model } from './model';

export interface CameraConfig {
  fov?: number;
  near?: number;
  far?: number;
  posZ?: number;
  name?: string;
  active?: boolean;
  fbo?: boolean | Partial<FramebufferConfig>;
}

export class Camera extends Model {
  active = false;
  readonly name: string;
  readonly size: Size = { width: 0, height: 0 };
  readonly view: Size = { width: 1, height: 1 };
  readonly framebuffer?: Framebuffer;
  readonly texture?: FramebufferTexture;
  private _projection: Mat4 = mat4();
  private config: Required<Pick<CameraConfig, 'fov' | 'near' | 'far' | 'posZ'>> & CameraConfig;

  constructor(
    private gl: WebGLRenderingContext,
    config: Partial<CameraConfig> = {},
    view?: Partial<Size>
  ) {
    super();

    this.config = { near: .1, far: 100, fov: 45, posZ: -3, ...config };
    this.active = this.config.active || !!this.config.fbo || false;
    this.name = this.config.name || crypto.randomUUID();

    if (this.config.posZ !== undefined) {
      this.position.z = this.config.posZ;
    }

    if (config.fbo) {
      this.framebuffer = new Framebuffer(gl, config.fbo === true ? {} : config.fbo);
      this.texture = this.framebuffer.texture;
    }

    this.resize(view?.width, view?.height);
  }

  get projection() {
    return this._projection;
  }

  /** Transforms pixel coordianate to clip space coordinate */
  cw(width: number) { return (width / this.view.width) * this.size.width; }
  ch(height: number) { return (height / this.view.height) * this.size.height; }
  cx(x: number, z = 0) {
    const fov = this.config.fov * Math.PI / 180;
    const aspect = this.view.width / this.view.height;
    const height = 2 * Math.tan(fov / 2) * Math.abs(this.position.z + z);
    const width = height * aspect * .5;
    const value = (x / this.view.width) * 2 - 1;

    return mapRange(value, -1, 1, -width, width);
  }

  cy(y: number, z = 0) {
    const fov = this.config.fov * Math.PI / 180;
    const height = 2 * Math.tan(fov / 2) * Math.abs(this.position.z + z) * .5;
    const value = (y / this.view.height * -1) * 2 + 1;

    return mapRange(value, -1, 1, -height, height);
  }

  draw() {
    this.updateModel();
  }

  bind() {
    this.framebuffer?.bind();
  }

  unbind() {
    this.framebuffer?.unbind();
  }

  resize(width?: number, height?: number) {
    if (typeof width === 'number') {
      this.view.width = width;
    }

    if (typeof height === 'number') {
      this.view.height = height;
    }

    const { near, far } = this.config;
    const fov = this.config.fov * Math.PI / 180;
    const aspect = this.view.width / this.view.height;

    this.size.height = 2 * Math.tan(fov / 2) * Math.abs(this.position.z);
    this.size.width = this.size.height * aspect;
    this._projection = mat4p(fov, aspect, near, far);

    if (this.framebuffer) {
      this.framebuffer.resize(width, height);
    }
  }
}