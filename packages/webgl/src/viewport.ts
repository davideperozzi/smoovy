import { isDef } from '@smoovy/utils';

import {
  Container, ContainerConfig, defaultContainerConfig,
} from './container';

export interface ViewportConfig extends WebGLContextAttributes, ContainerConfig {
  color: [ number, number, number ];
  width?: number;
  height?: number;
  pixelRatio: number;
}

const defaultConfig: ViewportConfig = {
  ...defaultContainerConfig,
  name: 'viewport',
  color: [ 0, 0, 0 ],
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

export class Viewport extends Container {
  private _gl: WebGLRenderingContext;
  private _containers: Container[] = [];
  protected config: ViewportConfig;

  constructor(
    public element: HTMLCanvasElement,
    config: Partial<ViewportConfig> = defaultConfig
  ) {
    const mergedConfig = { ...defaultConfig, ...config };

    super(mergedConfig);

    this.config = mergedConfig;

    const ctx = this.element.getContext('webgl2', this.config) ||
      this.element.getContext('webgl') ||
      this.element.getContext('webgl-experimental');

    if ( ! ctx) {
      throw new Error('WebGL not supported');
    }

    this._gl = ctx as WebGLRenderingContext;
  }

  get gl() {
    return this._gl;
  }

  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  attach() {
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

  get pixelRatio() {
    return this.config.pixelRatio || window.devicePixelRatio || 1;
  }

  setSize(width: number, height: number) {
    this.element.width = width * this.pixelRatio;
    this.element.height = height * this.pixelRatio;
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;

    this.setViewportSize({ width, height });
    this._containers.forEach(c => c.setViewportSize({ width, height }));
    this.gl.viewport(0, 0, width, height);
    this.emit(ViewportEvent.RESIZE, { width, height });
  }

  getContainerProjection(name: string) {
    return this.getContainer(name)?.projection;
  }

  getContainer(name: string) {
    return this._containers.find(c => c.name === name);
  }

  createContainer(config: Partial<ContainerConfig>) {
    const container = new Container(config);

    container.setViewportSize(this._viewportSize);

    this._containers.push(container);

    return container;
  }

  removeContainer(container: Container | string) {
    const index = this._containers.findIndex(c => {
      return typeof container === 'string'
        ? c.name === container
        : c === container;
    });

    if (index > -1) {
      this._containers.splice(index, 1);

      return true;
    }

    return false;
  }
}
