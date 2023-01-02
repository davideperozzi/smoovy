import { EventEmitter } from '@smoovy/emitter';
import { Unlisten } from '@smoovy/listener';
import { Observable, observe } from '@smoovy/observer';
import { Ticker } from '@smoovy/ticker';
import { Coordinate } from '@smoovy/utils';

import { GLMesh } from './mesh';
import { GLImage, GLImageConfig } from './meshes/image';
import { GLPlane, GLPlaneConfig } from './meshes/plane';
import { GLVideo, GLVideoConfig } from './meshes/video';
import { Viewport, ViewportConfig, ViewportEvent } from './viewport';

export interface WebGLConfig extends Partial<ViewportConfig> {
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
   * Automatically init WebGL on creation. If you disable this, you need
   * to call `.init()` manually.
   *
   * Default = true
   */
  autoCreate?: boolean;

  /**
   * This will position the canvas element as fixed and always sets its size
   * to the users screen size.
   *
   * Default = true
   */
  fullscreen?: boolean;
}

export enum WebGLEvent {
  BEFORE_RENDER = 'beforerender',
  AFTER_RENDER = 'afterrender'
}

export class WebGL extends EventEmitter {
  protected meshes: GLMesh[] = [];
  protected viewport: Viewport;
  protected observable: Observable<Window>;
  protected ticker: Ticker;
  private unlistenResize?: Unlisten;
  private paused = false;
  private lastTime = 0;
  private startTime = 0;
  private pauseTime = 0;
  private pauseStart = 0;

  constructor(
    protected config: WebGLConfig = {}
  ) {
    super();

    this.ticker = config.ticker || new Ticker();
    this.viewport = new Viewport(this.initCanvas(config.canvas), config);
    this.observable = observe(window);

    if (config.autoCreate !== false) {
      this.create();
    }
  }

  create() {
    if (this.config.fullscreen !== false) {
      const style = this.viewport.element.style;

      style.pointerEvents = 'none';
      style.position = 'fixed';
      style.left = '0px';
      style.top = '0px';

      this.unlistenResize = this.observable.onChange(state => {
        this.setSize(state.width, state.height);
      });
    }

    this.viewport.on(ViewportEvent.RESIZE, () => this.recalc());
    this.viewport.attach();

    this.startTime = Ticker.now();

    this.ticker.add((delta, time) => this.render(time));
  }

  destroy() {
    if (this.unlistenResize) {
      this.unlistenResize();
      delete this.unlistenResize;
    }

    this.ticker.kill();
  }

  private initCanvas(canvas?: HTMLCanvasElement | string) {
    if (canvas instanceof HTMLCanvasElement) {
      return canvas;
    }

    if (typeof canvas === 'string') {
      return document.querySelector(canvas) as HTMLCanvasElement;
    }

    const newCanvas = document.createElement('canvas');

    document.body.prepend(newCanvas);

    return newCanvas;
  }

  get vp() {
    return this.viewport;
  }

  get gl() {
    return this.viewport.gl;
  }

  setSize(width: number, height: number) {
    this.viewport.setSize(width, height);
  }

  clipSpaceX(x: number) {
    return this.viewport.getClipSpaceX(x);
  }

  clipSpaceY(y: number) {
    return this.viewport.getClipSpaceY(y);
  }

  clipSpaceW(width: number) {
    return this.viewport.getClipSpaceWidth(width);
  }

  clipSpaceH(height: number) {
    return this.viewport.getClipSpaceHeight(height);
  }

  scrollTo(pos: Partial<Coordinate>) {
    this.viewport.scrollTo(pos);
  }

  recalc() {
    for (let i = 0, len = this.meshes.length; i < len; i++) {
      this.meshes[i].recalc();
    }
  }

  pause(paused = true, track = true) {
    if (paused === this.paused) {
      return;
    }

    this.paused = paused;

    if (track) {
      if (paused) {
        this.pauseStart = Ticker.now();
      } else if (this.pauseStart > 0) {
        this.pauseTime += Ticker.now() - this.pauseStart;
        this.pauseStart = 0;
      }
    }
  }

  add(...meshes: GLMesh[]) {
    meshes.forEach(mesh => this.meshes.push(mesh.create()));

    return this;
  }

  remove(mesh: GLMesh) {
    const index = this.meshes.indexOf(mesh);

    if (index > -1) {
      this.meshes.splice(index, 1).forEach(m => m.destroy(this.viewport));
    }

    return this;
  }

  render(now = Ticker.now()) {
    const time = now - this.pauseTime - this.startTime;

    if (this.paused) {
      this.lastTime = time;

      return;
    }

    this.meshes = this.meshes.sort((a, b) => b.model[14] - a.model[14]);

    const enabledMeshes = this.meshes.filter(mesh => !mesh.disabled);

    if (enabledMeshes.length > 0) {
      this.emit(WebGLEvent.BEFORE_RENDER, time);
      this.viewport.render();

      for (let i = 0, len = enabledMeshes.length; i < len; i++) {
        enabledMeshes[i].render(time);
      }

      this.emit(WebGLEvent.AFTER_RENDER, time);
    }

    this.lastTime = time;
  }

  private createMesh<T, C>(Clazz: any, config: C, cb?: (mesh: T) => void): T {
    const mesh = new Clazz(this.viewport, config);

    if (typeof cb === 'function') {
      cb(mesh);
    }

    this.add(mesh);

    return mesh;
  }

  plane(config: GLPlaneConfig, cb?: (plane: GLPlane) => void) {
    return this.createMesh(GLPlane, config, cb);
  }

  video(config: GLVideoConfig, cb?: (video: GLVideo) => void) {
    return this.createMesh(GLVideo, config, cb);
  }

  image(config: GLImageConfig, cb?: (image: GLImage) => void) {
    return this.createMesh(GLImage, config, cb);
  }
}
