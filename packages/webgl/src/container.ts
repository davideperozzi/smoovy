import { EventEmitter } from '@smoovy/emitter';
import { Coordinate, Size, isNum, mapRange } from '@smoovy/utils';

import { Mat4, mat4, mat4i, mat4p, mat4t } from './utils/math';

export enum ContainerEvent {
  SCROLL = 'scroll'
}

export interface ContainerConfig {
  name: string;
  fov: number;
  posZ: number;
}

export const defaultContainerConfig: ContainerConfig = {
  name: 'default',
  fov: 45,
  posZ: -3
};

export class Container extends EventEmitter {
  private _projection: Mat4 = mat4();
  private _scrollPosition: Coordinate = { x: 0, y: 0 };
  protected _viewportSize: Size = { width: 0, height: 0 };
  protected config: ContainerConfig;

  constructor(config: Partial<ContainerConfig> = {}) {
    super();

    this.config = { ...defaultContainerConfig, ...config };
  }

  get projection() {
    return this._projection;
  }

  get fov() {
    return this.config.fov || defaultContainerConfig.fov;
  }

  get aspect() {
    return this._viewportSize.width / this._viewportSize.height;
  }

  get name() {
    return this.config.name || defaultContainerConfig.name;
  }

  get viewSize() {
    /** @todo: Cache view size to prevent unecessary recalc */
    const fovY = (this.config.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fovY / 2) * Math.abs(this.config.posZ);
    const width = height * this.aspect;

    return { width, height };
  }

  getClipSpaceX(pos: number) {
    const vWidth = this.viewSize.width * .5;

    return mapRange(
      (pos / this._viewportSize.width) * 2 - 1,
      -1,
      1,
      -vWidth,
      vWidth
    );
  }

  getClipSpaceY(pos: number) {
    const vHeight = this.viewSize.height * .5;

    return mapRange(
      (pos / this._viewportSize.height * -1) * 2 + 1,
      -1,
      1,
      -vHeight,
      vHeight
    );
  }

  getClipSpaceWidth(size: number) {
    return (size / this._viewportSize.width) * this.viewSize.width;
  }

  getClipSpaceHeight(size: number) {
    return (size / this._viewportSize.height) * this.viewSize.height;
  }

  getClipsSpaceCoord(x: number, y: number) {
    return {
      x: this.getClipSpaceX(x),
      y: this.getClipSpaceY(y)
    };
  }

  getClipsSpaceSize(width: number, height: number) {
    return {
      width: this.getClipSpaceWidth(width),
      height: this.getClipSpaceHeight(height)
    };
  }

  setViewportSize(size: Size) {
    this._viewportSize = size;

    this.updateProjection();
  }

  scrollTo(pos: Partial<Coordinate>) {
    if (isNum(pos.x) || isNum(pos.y)) {
      mat4t(this._projection, [
        isNum(pos.x)
          ? this.getClipSpaceWidth(this._scrollPosition.x - pos.x)
          : undefined,
        isNum(pos.y)
          ? this.getClipSpaceHeight(pos.y - this._scrollPosition.y)
          : undefined
      ]);

      if (isNum(pos.x)) {
        this._scrollPosition.x = pos.x;
      }

      if (isNum(pos.y)) {
        this._scrollPosition.y = pos.y;
      }
    }

    this.emit(ContainerEvent.SCROLL, this._scrollPosition);
  }

  protected updateProjection() {
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