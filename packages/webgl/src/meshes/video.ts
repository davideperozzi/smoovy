import { listen, listenCompose, Unlisten } from '@smoovy/listener';
import { Ticker, TickerTask } from '@smoovy/ticker';

import { TextureAttrBuffer } from '../buffers';
import { Program } from '../program';
import { triangulate } from '../utils/raster';
import { Viewport } from '../viewport';
import { GLPlane, GLPlaneConfig } from './plane';

export interface GLVideoConfig extends GLPlaneConfig {
  source: HTMLVideoElement;
}

const uvSize = { width: 1, height: 1 };

export class GLVideo extends GLPlane {
  private texture!: WebGLTexture | null;
  private textCoord = new TextureAttrBuffer();
  private unlistenVideo?: Unlisten;
  private playTask?: TickerTask;
  private ticker = Ticker.main;
  private video: HTMLVideoElement;
  private playing = false;

  public constructor(
    protected viewport: Viewport,
    protected config: GLVideoConfig
  ) {
    super(viewport, config);

    this.video = config.source;
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

        varying vec2 vTexCoord;

        void main() {
          gl_FragColor = texture2D(image, vTexCoord);
        }
      `
    );

    this.buffers.texCoord = this.textCoord;
    this.unlistenVideo = listenCompose(
      listen(this.video, 'play', () => this.handlePlay()),
      listen(this.video, 'pause', () => this.handleStop()),
      listen(this.video, 'stop', () => this.handleStop()),
      listen(this.video, 'playing', () => {
        this.playing = true;
      })
    );
  }

  public onCreate() {
    super.onCreate();

    this.texture = this.viewport.gl.createTexture();

    this.updateTexture();
  }

  public onDestroy() {
    super.onDestroy();

    if ( this.texture) {
      this.viewport.gl.deleteTexture(this.texture);
    }

    if (this.unlistenVideo) {
      this.unlistenVideo();
    }

    this.handleStop();
  }

  private handlePlay() {
    if ( ! this.playTask) {
      this.playTask = this.ticker.add(() => this.updateTexture());
    }
  }

  private handleStop() {
    if (this.playTask) {
      this.playTask.kill();
      delete this.playTask;
    }
  }

  private updateTexture() {
    if (this.texture && this.viewport && this.playing) {
      const gl = this.viewport.gl;
      const vid = this.video;

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, vid);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }

  protected beforeDraw() {
    if (this.viewport && this.texture) {
      const gl = this.viewport.gl;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
  }

  async recalc() {
    super.recalc();

    if (this.viewport && this.texture) {
      const gl = this.viewport.gl;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      this.textCoord.update(await triangulate(this.segments, uvSize));
    }
  }
}
