import { isNum, mapRange, Size } from '@smoovy/utils';

import { Framebuffer, FramebufferConfig } from './framebuffer';
import { FramebufferTexture } from './texture';

import { Mat4, mat4, mat4inv, mat4o, mat4p } from './math';
import { Model } from './model';
import { warnOnce } from './utils';

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
  readonly fbo?: Framebuffer;
  private _projection: Mat4 = mat4();
  private _worldView: Mat4 = mat4();
  private _viewScale = 1;
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
      this.config = { type: 'orthographic', near: .1, far: 100, ...defaults, ...config as any };
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
      this.fbo = new Framebuffer(gl, config.fbo === true ? {} : config.fbo);
    }

    this.resize(view?.width, view?.height);
  }

  get projection() {
    return this._projection;
  }

  get worldView() {
    return this._worldView;
  }

  get type() {
    return this.config.type;
  }

  pw(width: number) {
    return (width / this.size.width) * this.view.width;
  }

  ph(height: number) {
    return (height / this.size.height) * this.view.height;
  }

  cw(width: number) {
    return (width / this.view.width) * this.size.width;
  }

  ch(height: number) {
    return (height / this.view.height) * this.size.height;
  }

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

  bind() {
    this.fbo?.bind();
  }

  unbind() {
    this.fbo?.unbind();
  }

  resize(width?: number, height?: number) {
    if (isNum(width)) {
      this.view.width = width;
    }

    if (isNum(height)) {
      this.view.height = height;
    }

    const fov = this.config.fov * Math.PI / 180;
    const aspect = this.view.width / this.view.height;

    this.size.height = 2 * Math.tan(fov / 2) * Math.abs(this.position.z);
    this.size.width = this.size.height * aspect;

    this.updateProjection();

    if (this.fbo) {
      this.fbo.resize(width, height);
    }
  }

  set viewScale(scale: number) {
    this._viewScale = scale;

    this.updateProjection();
  }

  updateProjection() {
    const { type, near, far, fov } = this.config;
    const aspect = this.view.width / this.view.height;

    if (type === 'perspective') {
      this._projection = mat4p(fov * Math.PI / 180, aspect, near, far);
    } else if (type === 'orthographic') {
      const { left, right, top, bottom, near, far } = this.config;
      const hw = this.size.width / 2;
      const hh = this.size.height / 2;

      this._projection = mat4o(
        (isNum(left) ? left : -hw) / this._viewScale,
        (isNum(right) ? right : hw) / this._viewScale,
        (isNum(bottom) ? bottom : -hh) / this._viewScale,
        (isNum(top) ? top : hh) / this._viewScale,
        near,
        far
      );
    }
  }

  protected modelHasUpdated() {
    super.modelHasUpdated();

    mat4inv(this._world, this._worldView);
  }
}