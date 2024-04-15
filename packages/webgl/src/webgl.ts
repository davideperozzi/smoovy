import { EventEmitter } from '@smoovy/emitter';
import { Unlisten } from '@smoovy/listener';
import { Observable, observe } from '@smoovy/observer';
import { Ticker, TickerTask } from '@smoovy/ticker';
import { Size } from '@smoovy/utils';

import { Camera, CameraConfig } from './camera';
import { Plane, PlaneConfig } from './geometry/plane';
import { Mesh } from './mesh';
import { Renderer } from './renderer';
import {
  ImageTexture, ImageTextureConfig, VideoTexture, VideoTextureConfig,
} from './texture';
import { createCanvas } from './utils';

export interface WebGLConfig extends WebGLContextAttributes {
  /**
   * The canvas element you want to use. If you don't provide the config
   * with an element or selector a new canvas elemnt will be created and
   * prepended to the body element.
   */
  canvas?: HTMLCanvasElement | string;

  /**
   * Custom ticker. This is useful if you want something like frame-lock.
   * The default has no frame-lock.
   */
  ticker?: Ticker;

  /**
   * The order of the the ticker task. This is useful if you want to
   * control the order of the tasks. So if you have some values that
   * need to be calculated in the same frame before webgl renders
   *
   * @default 100
   */
  taskOrder?: number;

  /**
   * This will position the canvas element as fixed and always sets its size
   * to the users screen size.
   *
   * @default true
   */
  autoSize?: boolean;

  /**
   * Global uniforms that will be passed to all meshes. This is useful if
   * you want to pass some values to all meshes without setting them
   * manually. You can still override them on each mesh. The values will
   * be passed to the shader as a uniform with the name of the key.
   *
   * @default {}
   */
  uniforms?: Record<string, any>;

  /**
   * The pixel ratio of the canvas. This will be multiplied with the
   * width and height of the canvas.
   *
   * @default 1
   */
  dpr?: number;

  /**
   * The clear color of the canvas. This will be set on the first render
   * call.
   *
   * @default [0, 0, 0]
   */
  color?: [number, number, number];

  /**
   * Config for the main camera
   *
   * @default { posZ: -3, fov: 45, near: 0.1, far: 100  }
   */
  camera?: Partial<CameraConfig>;
}

export enum WebGLEvent {
  BEFORE_RENDER = 'beforerender',
  AFTER_RENDER = 'afterrender'
}

export class WebGL extends EventEmitter {
  readonly renderer: Renderer;
  protected readonly meshes: Mesh[] = [];
  protected canvas: HTMLCanvasElement;
  protected observable: Observable<Window>;
  protected ticker: Ticker;
  protected task?: TickerTask;
  private config: WebGLConfig;
  private context: WebGLRenderingContext;
  private unlisten?: Unlisten;
  private lastSize: Size = { width: 0, height: 0 };

  constructor(config: WebGLConfig = {}) {
    super();

    this.config = {
      color: [ 0, 0, 0 ],
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      dpr: 1,
      depth: true,
      ...config
    } as WebGLConfig;

    this.ticker = config.ticker || Ticker.main;
    this.canvas = createCanvas(config.canvas);
    this.observable = observe(window, { resizeDetection: true });
    this.context = (
      this.canvas.getContext('webgl2', config) ||
      this.canvas.getContext('webgl', config) ||
      this.canvas.getContext('webgl-experimental', config)
    ) as WebGLRenderingContext;
    this.renderer = new Renderer(
      this.context,
      this.meshes,
      this.config.ticker,
      this.config.taskOrder,
      this.config.camera,
      this.observable.size,
      this.config.uniforms
    );

    this.init();
    this.start();
  }

  get uniforms() {
    return this.config.uniforms || {};
  }

  get ctx() {
    return this.context;
  }

  init() {
    if (this.config.autoSize !== false) {
      const style = this.canvas.style;
      const size = this.observable.size;

      style.pointerEvents = 'none';
      style.position = 'fixed';
      style.left = '0px';
      style.top = '0px';

      this.setSize(size.width, size.height);

      this.unlisten = this.observable.onChange(state => {
        this.setSize(state.width, state.height);
      });
    }
  }

  start() {
    const gl = this.context;
    const color = this.config.color || [0, 0, 0];
    const alpha = this.config.alpha;

    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(color[0], color[1], color[2], alpha ? 0 : 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.renderer.start();
  }

  setSize(width: number, height: number) {
    if (this.lastSize.width === width && this.lastSize.height === height) {
      return;
    }

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.lastSize.width = width;
    this.lastSize.height = height;

    this.renderer.resize(width, height, this.config.dpr || 1);
  }

  remove(mesh: Mesh) {
    const index = this.meshes.indexOf(mesh);

    if (index > -1) {
      this.meshes.splice(index, 1).forEach(m => m.destroy());
    }

    return this;
  }

  plane(config: Partial<PlaneConfig> = {}) {
    const plane = new Plane(this.context, {
      camera: this.renderer.camera,
      ...config
    });

    this.meshes.push(plane);

    return plane;
  }

  camera(name: string, config?: Partial<CameraConfig>) {
    if ( ! config) {
      return this.renderer.getCamera(name);
    }

    return this.renderer.addCamera(
      name,
      new Camera(config, this.observable.size)
    );
  }

  image(config: ImageTextureConfig) {
    return new ImageTexture(this.context, config);
  }

  video(config: VideoTextureConfig) {
    return new VideoTexture(this.context, config);
  }

  destroy() {
    if (this.unlisten) {
      this.unlisten();
      delete this.unlisten;
    }

    if (this.task) {
      this.task.kill();
      delete this.task;
    }
  }
}