import { Unlisten } from '@smoovy/event';
import { observe } from '@smoovy/observer';
import { Ticker } from '@smoovy/ticker';
import { Coordinate } from '@smoovy/utils';

import { GLMesh } from './mesh';
import { GLImage, GLImageConfig } from './meshes/image';
import { GLPlane, GLPlaneConfig } from './meshes/plane';
import { GLVideo, GLVideoConfig } from './meshes/video';
import { Viewport, ViewportConfig, ViewportEvent } from './viewport';

export interface WebGLConfig extends ViewportConfig {
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

export class WebGL {
  protected meshes: GLMesh[] = [];
  protected viewport: Viewport;
  protected ticker: Ticker;
  private unlistenResize?: Unlisten;
  private paused = false;
  private lastTime = 0;

  public constructor(
    protected config: WebGLConfig = {}
  ) {
    this.ticker = config.ticker || new Ticker();
    this.viewport = new Viewport(this.initCanvas(config.canvas), config);

    if (config.autoCreate !== false) {
      this.create();
    }
  }

  public create() {
    if (this.config.fullscreen !== false) {
      const style = this.viewport.element.style;

      style.position = 'fixed';
      style.left = '0px';
      style.top = '0px';

      this.unlistenResize = observe(window).onUpdate((state) => {
        this.setSize(state.offset.width, state.offset.height);
      });
    }

    this.viewport.on(ViewportEvent.RESIZE, () => this.recalc());
    this.viewport.attach();
    this.ticker.add((delta, time) => {
      if ( ! this.paused) {
        this.render(time);
      } else {
        this.lastTime = time;
      }
    });
  }

  public destroy() {
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

  public get vp() {
    return this.viewport;
  }

  public get gl() {
    return this.viewport.gl;
  }

  public setSize(width: number, height: number) {
    this.viewport.setSize(width, height);
  }

  public clipSpaceX(x: number) {
    return this.viewport.getClipSpaceX(x);
  }

  public clipSpaceY(y: number) {
    return this.viewport.getClipSpaceY(y);
  }

  public clipSpaceW(width: number) {
    return this.viewport.getClipSpaceWidth(width);
  }

  public clipSpaceH(height: number) {
    return this.viewport.getClipSpaceHeight(height);
  }

  public scrollTo(pos: Partial<Coordinate>) {
    this.viewport.scrollTo(pos);
  }

  public recalc() {
    for (let i = 0, len = this.meshes.length; i < len; i++) {
      this.meshes[i].recalc();
    }
  }

  public pause(paused = true) {
    this.paused = paused;
  }

  public add(...meshes: GLMesh[]) {
    meshes.forEach(mesh => {
      mesh.create(this.viewport);
      this.meshes.push(mesh);
    });

    return this;
  }

  public remove(mesh: GLMesh) {
    const index = this.meshes.indexOf(mesh);

    if (index > -1) {
      this.meshes.splice(index, 1).forEach(mesh => {
        mesh.destroy(this.viewport);
      });
    }

    return this;
  }

  public render(time?: number) {
    this.meshes = this.meshes.sort((a, b) => b.model[14] - a.model[14]);

    for (let i = 0, len = this.meshes.length; i < len; i++) {
      this.meshes[i].render(time ?? this.lastTime);
    }

    this.lastTime = time ?? this.lastTime;
  }

  private createMesh<T, C>(ctor: any, config: C, cb?: (mesh: T) => void): T {
    const mesh = new ctor(config);

    if (typeof cb === 'function') {
      cb(mesh);
    }

    this.add(mesh);

    return mesh;
  }

  public plane(config: GLPlaneConfig, cb?: (plane: GLPlane) => void) {
    return this.createMesh(GLPlane, config, cb);
  }

  public video(config: GLVideoConfig, cb?: (video: GLVideo) => void) {
    return this.createMesh(GLVideo, config, cb);
  }

  public image(config: GLImageConfig, cb?: (image: GLImage) => void) {
    return this.createMesh(GLImage, config, cb);
  }
}
