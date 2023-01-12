import { listenCompose, Unlisten } from '@smoovy/listener';
import { Observable, observe, unobserve } from '@smoovy/observer';
import { Coordinate, Size } from '@smoovy/utils';

import { VertexAttrBuffer } from '../buffers';
import { GLMesh, GLMeshConfig } from '../mesh';
import { Program } from '../program';
import { mat4gs, mat4s, mat4ta } from '../utils/math';
import { triangulate } from '../utils/raster';
import { Viewport } from '../viewport';

export interface GLPlaneConfig extends GLMeshConfig {
  /**
   * The x position in pixels not in clip space points
   */
  x?: number;

  /**
   * The y position in pixels not in clip space points
   */
  y?: number;

  /**
   * The width in pixels not in clip space size
   */
  width?: number;

  /**
   * The height in pixels not in clip space size
   */
  height?: number;

  /**
   * The number of segments to use for rasterization of the mesh
   *
   * Default = { x: 5, y: 5 }
   */
  segments?: Coordinate | number;

  /**
   * If provided with an element, this mesh will sync with the DOM
   * element automatically
   */
  element?: HTMLElement;

  /**
   * If enabled the visiblity of the element will be watched automatically.
   * If the element is not in the viewport, it'll be removed from the render
   * queue. InterectionObserver will be used
   *
   * Default = true
   */
  elementCulling?: boolean;

  /**
   * Whether to redraw the element automatically if the size changes.
   *
   * Default = true
   */
  autoResize?: boolean;

  /**
   * Overwrites the default vertex shader with a custom one
   */
  vertex?: string;

  /**
   * Overwrites the default fragment shader with a custom one
   */
  fragment?: string;
}

export class GLPlane extends GLMesh {
  protected program: Program;
  protected observable?: Observable;
  private unlistenElement?: Unlisten;

  public constructor(
    protected viewport: Viewport,
    protected config: GLPlaneConfig
  ) {
    super(viewport, config);

    this.buffers.vertCoord = new VertexAttrBuffer(2);
    this.program = new Program(
      viewport.gl,
      config.vertex || `
        attribute vec4 vertCoord;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vertCoord;
        }
      `,
      config.fragment ||  `
        precision highp float;
        uniform vec3 color;

        void main() {
          gl_FragColor = vec4(
            color.r / 255.0,
            color.g / 255.0,
            color.b / 255.0,
            1.0
          );
        }
      `
    );
  }

  public onCreate() {
    super.onCreate();

    if (this.config.element) {
      this.observable = observe(this.config.element, {
        resizeDetection: true,
        visibilityDetection: true
      });

      this.unlistenElement = listenCompose(
        this.observable.onChange(state => {
          this.setSize(state.size);
          this.translate(state.coord);
          this.checkVisibility();
        }),
      );

      setTimeout(() => this.checkVisibility());
      setTimeout(() => this.checkVisibility(), 100);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected visibilityChanged(visible: boolean) {}

  private checkVisibility() {
    if (this.observable) {
      if (this.config.elementCulling !== false) {
        this.disabled = !this.observable.visible;
      }

      this.visibilityChanged(this.observable.visible);
    }
  }

  public onDestroy() {
    super.onDestroy();

    if (this.unlistenElement) {
      this.unlistenElement();
      delete this.unlistenElement;
    }

    if (this.observable) {
      unobserve(this.observable);
    }
  }

  public setElement(element: HTMLElement) {
    this.config.element = element;
  }

  public setSize(size: Partial<Size>) {
    let recalc = false;

    if (typeof size.width === 'number') {
      if (size.width !== this.config.width) {
        recalc = true;
      }

      this.config.width = size.width;
    }

    if (typeof size.height === 'number') {
      if (size.height !== this.config.height) {
        recalc = true;
      }

      this.config.height = size.height;
    }

    if (recalc && this.config.autoResize !== false) {
      this.recalc();
    }
  }

  public get x() {
    return this.config.x || 0;
  }

  public get y() {
    return this.config.y || 0;
  }

  public get width() {
    return this.config.width || 0;
  }

  public get height() {
    return this.config.height || 0;
  }

  public get clipSize() {
    return this.viewport.getClipsSpaceSize(
      this.config.width || 0,
      this.config.height || 0
    );
  }

  public get scaling() {
    const [ x, y ] = mat4gs(this.model);

    return { x, y };
  }

  public get translation() {
    return {
      x: this.config.x,
      y: this.config.y
    };
  }

  public get element() {
    return this.config.element;
  }

  public scale(x: number, y: number) {
    const scaling = mat4gs(this.model);
    const scaleX = x / scaling[0];
    const scaleY = y / scaling[1];

    mat4s(this.model, [ scaleX, scaleY, 1 ]);
  }

  public translate(pos: Partial<Coordinate>) {
    if (typeof pos.x === 'number') {
      mat4ta(this.model, [
        this.viewport.getClipSpaceX(this.config.x = pos.x)
      ]);
    }

    if (typeof pos.y === 'number') {
      mat4ta(this.model, [
        undefined,
        this.viewport.getClipSpaceY(this.config.y = pos.y)
      ]);
    }
  }

  public get segments(): Coordinate {
    if (typeof this.config.segments === 'number') {
      return {
        x: this.config.segments,
        y: this.config.segments
      };
    }

    if (this.config.segments instanceof Object) {
      return this.config.segments;
    }

    return { x: 2, y: 2 };
  }

  public recalc() {
    super.recalc();

    if (this.observable) {
      this.setSize(this.observable.size);
      this.translate(this.observable.coord);
    } else {
      this.translate({ x: this.config.x || 0, y: this.config.y || 0 });
    }

    const size = this.clipSize;
    const buffer = this.buffers.vertCoord;

    buffer.update(
      triangulate(this.segments, size, 0, -size.height)
    );
  }
}
