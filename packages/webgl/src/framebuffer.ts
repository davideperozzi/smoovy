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

    this.resize(
      config.width || gl.canvas.width,
      config.height || gl.canvas.height
    );
  }

  resize(width = this.size.width, height = this.size.height) {
    const gl = this.gl;

    this.size.width = width;
    this.size.height = height;

    this.texture.allocate(width, height);
    this.bind();
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture.handle,
      0
    );
    this.unbind();
  }

  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}