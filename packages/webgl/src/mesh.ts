import { EventEmitter } from '@smoovy/event';

import { Program, Uniform, UniformType } from './program';
import { mat4 } from './utils/math';
import { Viewport } from './viewport';
import { Buffer } from './buffers';

export enum GLMeshDrawMode {
  POINTS = 0,
  LINES = 1,
  LINE_STRIP = 2,
  LINE_LOOP = 3,
  TRIANGLES = 4,
  TRIANGLE_STRIP = 5,
  TRIANGLE_FAN = 6
}

export enum GLMeshEvent {
  BEFORE_RECALC = 'beforerecalc'
}

export interface GLMeshConfig {
  drawMode?: GLMeshDrawMode;
  uniforms?: { [name: string]: Uniform };
}

export class GLMesh extends EventEmitter {
  private animating = false;
  public disabled = false;
  protected program!: Program;
  protected viewport?: Viewport;
  protected _buffers: { [name: string]: Buffer } = {};
  protected _uniforms: { [name: string]: Uniform } = {};
  public readonly model = mat4();

  public constructor(
    protected config: GLMeshConfig = {}
  ) {
    super();

    this._uniforms.time = { type: UniformType.FLOAT, value: 0 };
    this._uniforms.modelViewMatrix = {
      type: UniformType.MAT4,
      value: this.model
    };

    if (config.uniforms) {
      this._uniforms = Object.assign(this._uniforms, config.uniforms);
    }
  }

  public render(time = 0) {
    if (this.disabled) {
      return;
    }

    if (this.viewport && this.animating) {
      const gl = this.viewport.gl;
      let verticesCount = 0;

      this.program.use(gl);

      // update buffers
      for (const name in this._buffers) {
        const buffer = this._buffers[name];

        if (buffer instanceof Buffer) {
          verticesCount += this.program.updateAttrib(gl, name, buffer);
        }
      }

      // update uniforms
      for (const name in this._uniforms) {
        const uniform = this._uniforms[name];

        if (name === 'time') {
          uniform.value = time / 1000;
        }

        this.program.updateUniform(gl, name, uniform);
      }

      const mode = typeof this.config.drawMode !== 'undefined'
        ? this.config.drawMode
        : GLMeshDrawMode.TRIANGLES

      this.beforeDraw();
      gl.drawArrays(mode, 0, verticesCount);
      this.afterDraw();
    }
  }

  public recalc() {
    this.emit(GLMeshEvent.BEFORE_RECALC);

    for (const name in this._buffers) {
      this._buffers[name].update();
    }
  }

  public get uniforms() {
    return this._uniforms;
  }

  public get buffers() {
    return this._buffers;
  }

  public create(viewport: Viewport) {
    this.viewport = viewport;

    this._uniforms.projectionMatrix = {
      type: UniformType.MAT4,
      value: viewport.projection
    };

    this.program.create(viewport.gl);

    for (const name in this._buffers) {
      this._buffers[name].create(viewport.gl);
    }

    this.recalc();
    this.onCreate();

    this.animating = true;
  }

  public destroy(viewport: Viewport) {
    this.animating = false;

    delete this._uniforms.projectionMatrix;

    this.program.destroy(viewport.gl);

    for (const name in this._buffers) {
      this._buffers[name].destroy(viewport.gl);
    }

    this.onDestroy();
  }

  public uniform(name: string, value: number[] | number) {
    let type = UniformType.FLOAT;

    if (value instanceof Array) {
      switch (value.length) {
        case 2: type = UniformType.VEC2; break;
        case 3: type = UniformType.VEC3; break;
        case 4: type = UniformType.VEC4; break;
      }
    }

    this._uniforms[name] = { type, value };

    return this;
  }

  protected beforeDraw() {}
  protected afterDraw() {}
  public onCreate() {}
  public onDestroy() {}
}
