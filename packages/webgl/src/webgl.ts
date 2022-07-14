import { Ticker } from '@smoovy/ticker';
import { Coordinate } from '@smoovy/utils';

import { Mesh } from './mesh';
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
  autoInit?: boolean;
}

export class WebGL {
  protected meshes: Mesh[] = [];
  protected viewport: Viewport;
  protected ticker: Ticker;
  private paused = false;
  private lastTime = 0;

  public constructor(
    protected config: WebGLConfig
  ) {
    this.ticker = config.ticker || new Ticker();
    this.viewport = new Viewport(this.initCanvas(config.canvas), config);

    if (config.autoInit !== false) {
      this.init();
    }
  }

  public init() {
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

  public add(...meshes: Mesh[]) {
    meshes.forEach(mesh => {
      mesh.create(this.viewport);
      this.meshes.push(mesh);
    });
  }

  public remove(mesh: Mesh) {
    const index = this.meshes.indexOf(mesh);

    if (index > -1) {
      this.meshes.splice(index, 1).forEach(mesh => {
        mesh.destroy(this.viewport);
      });
    }
  }

  public render(time?: number) {
    this.meshes = this.meshes.sort((a, b) => b.model[14] - a.model[14]);

    for (let i = 0, len = this.meshes.length; i < len; i++) {
      this.meshes[i].render(time ?? this.lastTime);
    }

    this.lastTime = time ?? this.lastTime;
  }
}
