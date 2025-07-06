import { Size } from '@smoovy/utils';
import { FramebufferTexture, FramebufferTextureConfig } from './texture';

export interface FramebufferConfig extends FramebufferTextureConfig {
  width?: number;
  height?: number;
}

export class Framebuffer {
  readonly texture: FramebufferTexture;
  private framebuffer: WebGLFramebuffer;
  readonly size: Size = { width: 0, height: 0 };

  constructor(private gl: WebGLRenderingContext, config: Partial<FramebufferConfig> = {}) {
    this.texture = new FramebufferTexture(gl, config);
    this.framebuffer = gl.createFramebuffer()!;
    this.resize(config.width || gl.canvas.width, config.height || gl.canvas.height);
  }

  resize(width: number, height: number) {
    const gl = this.gl;

    this.size.width = width;
    this.size.height = height;

    gl.bindTexture(gl.TEXTURE_2D, this.texture.handle);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.handle, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  use(cb?: () => void) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    if (cb) {
      cb();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
