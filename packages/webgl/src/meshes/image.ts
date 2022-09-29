import { listenEl } from '@smoovy/event';
import { Resolver } from '@smoovy/utils';

import { TextureAttrBuffer } from '../buffers';
import { Program } from '../program';
import { segmentateSquare, SegmentMode } from '../utils/raster';
import { Viewport } from '../viewport';
import { GLPlane, GLPlaneConfig } from './plane';

export interface GLImageConfig extends GLPlaneConfig {
  source: string;

  /**
   * If this is enabled the image will be loaded immediately on creation.
   *
   * Default = true
   */
  autoLoad?: boolean;
}

export enum GLImageEvent {
  LOADEND = 'loadend'
}

export class GLImage extends GLPlane {
  private texture: WebGLTexture | null;
  private image: HTMLImageElement;
  private loadResolver = new Resolver();
  private imageLoading = false;

  public constructor(
    protected viewport: Viewport,
    protected config: GLImageConfig
  ) {
    super(viewport, config);

    this.program = new Program(
      viewport.gl,
      config.vertex || `
        attribute vec4 vertCoord;
        attribute vec2 texCoord;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        varying vec2 vTexCoord;

        void main() {
          vTexCoord = texCoord;
          gl_Position = projectionMatrix * modelViewMatrix * vertCoord;
        }
      `,
      config.fragment || `
        precision mediump float;

        uniform sampler2D image;
        uniform float time;

        varying vec2 vTexCoord;

        void main() {
          gl_FragColor = texture2D(image, vTexCoord);
        }
      `
    );

    this.buffers.texCoord = new TextureAttrBuffer();
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';

    listenEl(this.image, 'load', () => this.handleLoad());

    if (config.autoLoad !== false) {
      this.load();
    }
  }

  private handleLoad() {
    this.emit(GLImageEvent.LOADEND);
    this.loadResolver.resolve();
    this.setSize(this.imageSize);

    if (this.texture) {
      const gl = this.viewport.gl;
      const img = this.image;

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.bindTexture(gl.TEXTURE_2D, null);

      this.recalc();
    }
  }

  public get imageSize() {
    return {
      width: this.image.naturalWidth,
      height: this.image.naturalHeight
    };
  }

  public isLoading() {
    return this.imageLoading;
  }

  public get loaded() {
    return this.loadResolver.promise;
  }

  public isLoaded() {
    return this.loadResolver.completed;
  }

  public load() {
    if ( ! this.imageLoading && ! this.loadResolver.completed) {
      this.imageLoading = true;
      this.image.src = this.config.source;
    }

    return this.loadResolver.promise;
  }

  protected beforeDraw() {
    if (this.texture) {
      const gl = this.viewport.gl;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
  }

  public recalc() {
    super.recalc();

    if (this.texture) {
      const gl = this.viewport.gl;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      this.buffers.texCoord.update(
        segmentateSquare(
          this.segments,
          { width: 1, height: 1 },
          { x: 0, y: 0 },
          SegmentMode.TEXTURE
        )
      );
    }
  }

  public onCreate() {
    super.onCreate();

    this.texture = this.viewport.gl.createTexture();
  }

  public onDestroy() {
    super.onCreate();

    if (this.texture) {
      this.viewport.gl.deleteTexture(this.texture);
    }
  }
}
