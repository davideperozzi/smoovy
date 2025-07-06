import { mapRange, Size } from '@smoovy/utils';

import { Framebuffer, FramebufferConfig } from './framebuffer';
import { FramebufferTexture } from './texture';

import { Mat4, mat4, mat4p } from './math';
import { Model } from './model';

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  posZ: number;
  framebuffer?: boolean | Partial<FramebufferConfig>;
}

export class Camera extends Model {
  readonly size: Size = { width: 0, height: 0 };
  readonly view: Size = { width: 1, height: 1 };
  private _projection: Mat4 = mat4();
  private config: CameraConfig;
  readonly framebuffer?: Framebuffer;
  readonly texture?: FramebufferTexture;

  constructor(
    private gl: WebGLRenderingContext,
    config: Partial<CameraConfig> = {},
    view?: Partial<Size>
  ) {
    super();

    this.config = { near: .1, far: 100, fov: 45, posZ: -3, ...config };
    this.position.z = this.config.posZ;

    if (config.framebuffer) {
      const fbConfig = config.framebuffer === true ? {} : config.framebuffer;
      this.framebuffer = new Framebuffer(gl, fbConfig);
      this.texture = this.framebuffer.texture;
    }

    this.updateView(view?.width, view?.height);
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

  updateView(width?: number, height?: number) {
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
  }
}