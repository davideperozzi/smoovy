import { EventEmitter } from '@smoovy/emitter';
import { Coordinate, isDef, mapRange, Size } from '@smoovy/utils';

import { mat4, Mat4, mat4i, mat4p, mat4t } from './utils/math';

export interface ViewportConfig extends WebGLContextAttributes {
  color: [ number, number, number ];
  width?: number;
  height?: number;
  fov: number;
  posZ: number;
  pixelRatio: number;
}

const defaultConfig: ViewportConfig = {
  fov: 45,
  color: [ 0, 0, 0 ],
  posZ: -3,
  alpha: true,
  antialias: true,
  premultipliedAlpha: true,
  pixelRatio: 1,
  depth: true
};

export enum ViewportEvent {
  RESIZE = 'resize',
  SCROLL = 'scroll'
}

export class Viewport extends EventEmitter {
  private _gl: WebGLRenderingContext;
  private _projection: Mat4 = mat4();
  private _scrollPosition: Coordinate = { x: 0, y: 0 };
  protected config: ViewportConfig;
  public size: Size = { width: 0, height: 0 };

  public constructor(
    public element: HTMLCanvasElement,
    config: Partial<ViewportConfig> = defaultConfig
  ) {
    super();

    this.config = { ...defaultConfig, ...config };

    const ctx = this.element.getContext('webgl2', this.config) ||
      this.element.getContext('webgl') ||
      this.element.getContext('webgl-experimental');

    if ( ! ctx) {
      throw new Error('WebGL not supported');
    }

    this._gl = ctx as WebGLRenderingContext;
  }

  public get scrollPosition() {
    return this._scrollPosition;
  }

  public get gl() {
    return this._gl;
  }

  public get aspect() {
    return this.size.width / this.size.height;
  }

  public get projection() {
    return this._projection;
  }

  public get width() {
    return this.size.width;
  }

  public get height() {
    return this.size.height;
  }

  public render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  public getClipSpaceX(pos: number) {
    const vWidth = this.viewSize.width * .5;

    return mapRange((pos / this.width) * 2 - 1, -1, 1, -vWidth, vWidth);
  }

  public getClipSpaceY(pos: number) {
    const vHeight = this.viewSize.height * .5;

    return mapRange((pos / this.height * -1) * 2 + 1, -1, 1, -vHeight, vHeight);
  }

  public getClipsSpaceCoord(x: number, y: number) {
    return {
      x: this.getClipSpaceX(x),
      y: this.getClipSpaceY(y)
    };
  }

  public getClipsSpaceSize(width: number, height: number) {
    return {
      width: this.getClipSpaceWidth(width),
      height: this.getClipSpaceHeight(height)
    };
  }

  public getClipSpaceWidth(size: number) {
    return (size / this.width) * this.viewSize.width;
  }

  public getClipSpaceHeight(size: number) {
    return (size / this.height) * this.viewSize.height;
  }

  public attach() {
    this.setSize(
      isDef(this.config.width)
        ? this.config.width
        : this.element.offsetWidth,
      isDef(this.config.height)
        ? this.config.height
        : this.element.offsetHeight
    );

    const color = this.config.color || [0, 0, 0];
    const alpha = this.config.alpha;

    this.gl.enable(this.gl.BLEND);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(color[0], color[1], color[2], alpha ? 0 : 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  public get pixelRatio() {
    return this.config.pixelRatio || window.devicePixelRatio || 1;
  }

  public get fov() {
    return this.config.fov || defaultConfig.fov;
  }

  public setSize(width: number, height: number) {
    this.size.width = width;
    this.size.height = height;
    this.element.width = width * this.pixelRatio;
    this.element.height = height * this.pixelRatio;
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;

    this.updateProjection();
    this.gl.viewport(0, 0, width, height);
    this.emit(ViewportEvent.RESIZE, { ...this.size });
  }

  public scrollTo(pos: Partial<Coordinate>) {
    if (typeof pos.x === 'number') {
      mat4t(this._projection, [
        this.getClipSpaceWidth(this._scrollPosition.x - pos.x)
      ]);

      this._scrollPosition.x = pos.x;
    }

    if (typeof pos.y === 'number') {
      mat4t(this._projection, [
        undefined,
        this.getClipSpaceHeight(pos.y - this._scrollPosition.y)
      ]);

      this._scrollPosition.y = pos.y;
    }

    this.emit(ViewportEvent.SCROLL, this._scrollPosition);
  }

  public get viewSize() {
    /** @todo: Cache view size to prevent unecessary recalc */
    const fovY = (this.config.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fovY / 2) * Math.abs(this.config.posZ);
    const width = height * this.aspect;

    return { width, height };
  }

  private updateProjection() {
    this._projection = mat4p(
      mat4i(this._projection),
      this.config.fov * Math.PI / 180,
      this.aspect,
      .1,
      100
    );

    mat4t(this._projection, [
      this.getClipSpaceWidth(this._scrollPosition.x),
      this.getClipSpaceHeight(this._scrollPosition.y),
      this.config.posZ
    ]);
  }
}
