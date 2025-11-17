import { Size } from '@smoovy/utils';
import { FramebufferTexture, FramebufferTextureConfig } from './texture';

export interface FramebufferConfig extends FramebufferTextureConfig {
  width?: number;
  height?: number;
}

export class Framebuffer {
  private framebuffer: WebGLFramebuffer;
  readonly texture: FramebufferTexture;
  readonly size: Size = { width: 0, height: 0 };

  constructor(private gl: WebGLRenderingContext, config: Partial<FramebufferConfig> = {}) {
    this.texture = new FramebufferTexture(gl, { depth: true, ...config });
    this.framebuffer = gl.createFramebuffer()!;

    this.resize(
      config.width || gl.canvas.width,
      config.height || gl.canvas.height
    );
  }

  resize(width = this.size.width, height = this.size.height) {
    this.size.width = width;
    this.size.height = height;

    this.bind();
    this.texture.allocate(width, height);
    this.unbind();
  }

  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}