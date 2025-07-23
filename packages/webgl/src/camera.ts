import { isNum, mapRange, Size } from '@smoovy/utils';

import { Framebuffer, FramebufferConfig } from './framebuffer';
import { FramebufferTexture } from './texture';

import { Mat4, mat4, mat4inv, mat4o, mat4p } from './math';
import { Model } from './model';

export interface CameraOrthographicConfig {
  type: 'orthographic';
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export type CameraConfig = (CameraOrthographicConfig | { type: 'perspective' }) & {
  near: number;
  fov: number;
  far: number;
  posZ: number;
  name: string;
  active: boolean;
  fbo: boolean | Partial<FramebufferConfig>;
  scopes: (string|number)[];
}

export class Camera extends Model {
  readonly name: string;
  readonly size: Size = { width: 0, height: 0 };
  readonly view: Size = { width: 1, height: 1 };
  readonly framebuffer?: Framebuffer;
  readonly texture?: FramebufferTexture;
  private _projection: Mat4 = mat4();
  private _worldView: Mat4 = mat4();
  private config: CameraConfig;

  constructor(
    private gl: WebGLRenderingContext,
    config: Partial<CameraConfig> = {},
    view?: Partial<Size>
  ) {
    super();

    if (config.scopes) {
      this.scopes.length = 0;
      this.scopes.push(...config.scopes);
    }

    const defaults = { fov: 45, posZ: 5, active: true };

    if (config.type === 'orthographic') {
      this.config = { type: 'orthographic', near: -10000, far: 10000, ...defaults, ...config as any };
    } else {
      this.config = { type: 'perspective', near: .1, far: 100, ...defaults, ...config as any };
    }

    this.name = this.config.name || crypto.randomUUID();

    if (this.config.posZ !== undefined) {
      this.z = this.config.posZ;
    }

    if (!this.config.active) {
      this.disable();
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

  get worldView() {
    return this._worldView;
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
    if (isNum(width)) {
      this.view.width = width;
    }

    if (isNum(height)) {
      this.view.height = height;
    }

    const { type, near, far } = this.config;
    const fov = this.config.fov * Math.PI / 180;
    const aspect = this.view.width / this.view.height;

    this.size.height = 2 * Math.tan(fov / 2) * Math.abs(this.position.z);
    this.size.width = this.size.height * aspect;

    if (type === 'perspective') {
      this._projection = mat4p(fov, aspect, near, far);
    } else if (type === 'orthographic') {
      const { left, right, top, bottom } = this.config;
      const hw = this.size.width / 2;
      const hh = this.size.height / 2;

      this._projection = mat4o(
        isNum(left) ? left : -hw,
        isNum(right) ? right : hw,
        isNum(bottom) ? bottom : -hh,
        isNum(top) ? top : hh,
        near,
        far
      );
    }

    if (this.framebuffer) {
      this.framebuffer.resize(width, height);
    }
  }

  protected modelHasUpdated() {
    mat4inv(this._world, this._worldView);
  }
}