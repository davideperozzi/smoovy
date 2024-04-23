import { Ticker } from "@smoovy/ticker";
import { Resolver } from "@smoovy/utils";

export interface TextureConfig {
  wrapS?: number;
  wrapT?: number;
  minFilter?: number;
  unpackFlip?: boolean;
}

export interface ImageTextureConfig extends TextureConfig {
  src: string;
  load?: boolean;
}

export interface VideoTextureConfig extends TextureConfig {
  src: string | HTMLVideoElement;
}

export type FramebufferTextureConfig = TextureConfig;

export class TextureMediaLoader {
  static readonly images = new Map<string, Promise<HTMLImageElement>>();

  static load(source: string) {
    const cache = TextureMediaLoader.images;

    if (cache.has(source)) {
      return cache.get(source)!;
    }

    const image = new Image();

    image.src = source;
    image.crossOrigin = 'anonymous';

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      image.addEventListener('error', (err) => reject(err));
      image.addEventListener('load', () => resolve(image));
    });

    cache.set(source, promise);

    return promise;
  }
}

export class Texture<C extends TextureConfig = TextureConfig> {
  protected texture: WebGLTexture;
  protected resolver = new Resolver<boolean>();

  constructor(
    protected gl: WebGLRenderingContext,
    protected config: C
  ) {
    this.texture = gl.createTexture()!;
  }

  bind(slot = 0, location?: WebGLUniformLocation) {
    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (location) {
      gl.uniform1i(location, slot);
    }
  }

  unbind(slot = 0) {
     const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  upload(data: any) {
    const gl = this.gl;
    const config = this.config;
    const wrapS = config.wrapS || gl.CLAMP_TO_EDGE;
    const wrapT = config.wrapT || gl.CLAMP_TO_EDGE;
    const minFilter = config.minFilter || gl.LINEAR;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, config.unpackFlip !== false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if ( ! this.resolver.completed) {
      this.resolver.resolve(true);
    }
  }

  get uploaded() {
    return this.resolver.promise;
  }

  destroy() {}
}

export class ImageTexture extends Texture<ImageTextureConfig> {
  constructor(
    gl: WebGLRenderingContext,
    config: ImageTextureConfig
  ) {
    super(gl, config);

    if (config.load !== false) {
      this.load();
    }
  }

  load() {
    TextureMediaLoader.load(this.config.src).then((image) => {
      this.upload(image);
    });
  }
}

export class VideoTexture extends Texture<VideoTextureConfig> {
  readonly video: HTMLVideoElement;
  private rvfcSupported = false;
  private updateVideoCbRVFC: () => void;

  constructor(
    gl: WebGLRenderingContext,
    config: VideoTextureConfig
  ) {
    super(gl, config);

    if (config.src instanceof HTMLVideoElement) {
      this.video = config.src;
    } else {
      this.video = document.createElement('video');
      this.video.muted = true;
      this.video.src = config.src;
    }

    this.rvfcSupported = 'requestVideoFrameCallback' in this.video;
    this.updateVideoCbRVFC = this.updateVideoRVFC.bind(this);

    if (this.rvfcSupported) {
      this.video.requestVideoFrameCallback(() => this.updateVideoRVFC());
      Ticker.main.add((delta, time, kill) => {
        if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
          this.updateVideo();
          kill();
        }
      });
    } else {
      let first = true;

      Ticker.main.add(() => {
        const ready = this.video.readyState >= this.video.HAVE_CURRENT_DATA;

        if ((ready && ! this.video.paused) || (ready && first)) {
          first = false;

          this.updateVideo();
        }
      });
    }
  }

  private updateVideoRVFC() {
    this.updateVideo();
    this.video.requestVideoFrameCallback(this.updateVideoCbRVFC);
  }

  private updateVideo() {
    const gl = this.gl;
    const vid = this.video;

    if ( ! this.resolver.completed) {
      this.upload(vid);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, vid);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }
}

export class FramebufferTexture extends Texture<FramebufferTextureConfig> {}