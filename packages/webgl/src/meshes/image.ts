import { listen, listenCompose } from '@smoovy/listener';
import { Resolver } from '@smoovy/utils';

import { TextureAttrBuffer } from '../buffers';
import { Program } from '../program';
import { triangulate } from '../utils/raster';
import { Viewport } from '../viewport';
import { GLPlane, GLPlaneConfig } from './plane';

export interface GLImageConfig extends GLPlaneConfig {
  /**
   * The source to the image as a string. This can be an external url as well
   */
  source: string;

  /**
   * If this is enabled the image will be loaded immediately on creation.
   *
   * Default = true
   */
  autoLoad?: boolean;

  /**
   * Whether to load the image when the element it's entered the viewport.
   * This is only available of the `element` option has been set
   *
   * Default = true
   */
  visibleLoad?: boolean;

  /**
   * Whether to unload the texture and remove it from the cache when the image
   * has been destroyed.
   *
   * Default = false
   */
  noCache?: boolean;

  /**
   * The name of the unfiform sampler inside the shader for the main
   * image. Others texture can be added via `addTexture`.
   *
   * Default = image
   */
  mainSlot?: string;
}

export enum GLImageEvent {
  LOADEND = 'loadend',
  BIND_TEXTURE = 'bindtexture'
}

const uvSize = { width: 1, height: 1 };

export interface GlImageTexture {
  texture: WebGLTexture;
  image: HTMLImageElement;
  keep?: boolean;
}

export class GLImage extends GLPlane {
  private static cache = new Map<string, GlImageTexture>();
  private textures: Map<string, GlImageTexture> = new Map();
  private loadResolver = new Resolver();
  private imageLoading = false;

  public constructor(
    protected viewport: Viewport,
    protected config: GLImageConfig
  ) {
    super(viewport, config);

    this.buffers.texCoord = new TextureAttrBuffer();
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

    if (
      (config.autoLoad !== false && ! this.element) ||
      (config.autoLoad !== false && this.element && config.visibleLoad === false)
    ) {
      this.load();
    }
  }

  public static async preload(
    gl: WebGLRenderingContext,
    src: string,
    keep = false
  ) {
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.src = src;

    return new Promise<GlImageTexture>((resolve, reject) => {
      const unlisten = listenCompose(
        listen(image, 'error', (err) => {
          unlisten();
          reject(err);
        }),
        listen(image, 'load', () => {
          unlisten();

          const texture = GLImage.loadTexture(gl, image);

          if (texture) {
            const entry: GlImageTexture = { texture, image, keep };

            this.cache.set(src, entry);
            resolve(entry);
          } else {
            reject(new Error('could not load texture: ' + src));
          }
        })
      );
    });
  }

  private static loadTexture(
    gl: WebGLRenderingContext,
    image: HTMLImageElement,
    tex?: WebGLTexture
  ) {
    const texture = tex || gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }

  private static unloadTexture(
    gl: WebGLRenderingContext,
    tex: WebGLTexture
  ) {
    const removes: string[] = [];

    GLImage.cache.forEach(({ texture, keep }, src) => {
      if (texture === tex && ! keep) {
        removes.push(src);
      }
    });

    removes.forEach(src => GLImage.cache.delete(src));

    const items = Array.from(GLImage.cache.values());
    const remaining = items.filter(({ texture }) => tex === texture);

    if (remaining.length === 0) {
      gl.deleteTexture(tex);
    }
  }

  protected visibilityChanged(visible: boolean) {
    if (visible && ! this.isLoaded() && this.config.visibleLoad !== false) {
      this.load();
    }
  }

  public get imageSize() {
    const item = this.textures.get('image');

    return {
      width: item?.image ? item.image.naturalWidth : 0,
      height: item?.image ? item.image.naturalHeight : 0
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

  private loadEnd() {
    if (this.loadResolver.completed) {
      console.warn('image loadend already called');
      return
    }

    this.emit(GLImageEvent.LOADEND);
    this.loadResolver.resolve();

    this.imageLoading = false;

    if (this.config.width === undefined && this.config.height === undefined) {
      this.setSize(this.imageSize);
    }
  }

  public setSource(source: string) {
    this.config.source = source;
    this.imageLoading = false;
    this.loadResolver = new Resolver();

    return this.load();
  }

  public async load() {
    await this.created.promise;

    if (this.loadResolver.completed || this.imageLoading) {
      return this.loadResolver.promise;
    }

    const mainSlot = this.config.mainSlot || 'image';

    if (GLImage.cache.has(this.config.source)) {
      const cache = GLImage.cache.get(this.config.source);

      if (cache && cache.texture && cache.image) {
        this.imageLoading = true;

        this.textures.set(mainSlot, cache);
        this.loadEnd();
      } else {
        console.warn('image: cache is invalid for ' + this.config.source);
      }
    } else {
      this.imageLoading = true;


      const prevTexture = this.textures.get(mainSlot);

      await this.loadTexture(mainSlot, this.config.source);
      this.loadEnd();

      if (prevTexture) {
        this.unloadTexture(prevTexture.texture);
      }
    }

    return this.loadResolver.promise;
  }

  public async loadTexture(name: string, src: string, keep = false) {
    return this.setTexture(
      name,
      await GLImage.preload(this.viewport.gl, src, keep)
    );
  }

  public setTexture(name: string, texture: GlImageTexture) {
    this.textures.set(name, texture);

    return texture;
  }

  protected bindTextures() {
    const gl = this.viewport.gl;
    let slot = 0;

    this.textures.forEach(({ texture }, name) => {
      const location = this.program.registerUniform(name);

      slot++;

      if (location) {
        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(location, slot);
      }
    });

    this.emit(GLImageEvent.BIND_TEXTURE);
  }

  protected unbindTextures() {
    const gl = this.viewport.gl;

    for (let i = 0, len = this.textures.size + 1; i < len; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }

  public render(time = 0) {
    if (this.textures.size > 0) {
      super.render(time);
    }
  }

  protected beforeDraw() {
    super.beforeDraw();

    this.bindTextures();
  }

  protected afterDraw() {
    super.beforeDraw();

    this.unbindTextures();
  }

  public recalc() {
    this.bindTextures();
    this.buffers.texCoord.update(triangulate(this.segments, uvSize));

    super.recalc();
  }

  public unloadTexture(texture: WebGLTexture | null) {
    if (texture && this.config.noCache === true) {
      GLImage.unloadTexture(this.viewport.gl, texture);
    }
  }

  public onDestroy() {
    super.onDestroy();

    this.textures.forEach(({ texture }) => this.unloadTexture(texture));
  }
}
