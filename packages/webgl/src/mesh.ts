import { EventEmitter } from '@smoovy/emitter';
import { Resolver } from '@smoovy/utils';

import { Buffer } from './buffers';
import { Program, Uniform, UniformType } from './program';
import { mat4 } from './utils/math';
import { Viewport } from './viewport';

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
  BEFORE_RECALC = 'beforerecalc',
  BEFORE_DRAW = 'beforedraw',
  AFTER_DRAW = 'afterdraw'
}

export interface GLMeshConfig {
  features?: { value: GLenum, disable?: boolean }[];
  drawMode?: GLMeshDrawMode;
  uniforms?: { [name: string]: Uniform };
}

export class GLMesh extends EventEmitter {
  private animating = false;
  public disabled = false;
  protected created = new Resolver();
  protected program!: Program;
  protected _buffers: { [name: string]: Buffer } = {};
  protected _uniforms: { [name: string]: Uniform } = {};
  public readonly model = mat4();

  public constructor(
    protected viewport: Viewport,
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

    if (this.animating) {
      let verticesCount = 0;

      this.program.use();

      // update buffers
      for (const name in this._buffers) {
        if (Object.prototype.hasOwnProperty.call(this._buffers, name)) {
          const buffer = this._buffers[name];

          if (buffer instanceof Buffer) {
            verticesCount += this.program.updateAttrib(name, buffer);
          }
        }
      }

      // update uniforms
      for (const name in this._uniforms) {
        if (Object.prototype.hasOwnProperty.call(this._uniforms, name)) {
          const uniform = this._uniforms[name];

          if (name === 'time') {
            uniform.value = time / 1000;
          }

          this.program.updateUniform(name, uniform);
        }
      }

      const mode = typeof this.config.drawMode !== 'undefined'
        ? this.config.drawMode
        : GLMeshDrawMode.TRIANGLES;

      this.beforeDraw();
      this.emit(GLMeshEvent.BEFORE_DRAW);

      const gl = this.viewport.gl;
      const features = this.config.features;
      let enables: GLenum[] | undefined;
      let disables: GLenum[] | undefined;

      if (features) {
        enables = [];
        disables = [];

        for (const feature of features) {
          const wasEnabled = gl.getParameter(feature.value);

          if (wasEnabled) {
            enables.push(feature.value);
          } else {
            disables.push(feature.value);
          }

          if (feature.disable) {
            gl.disable(feature.value);
          } else {
            gl.enable(feature.value);
          }
        }
      }

      gl.drawArrays(mode, 0, verticesCount);

      this.afterDraw();
      this.emit(GLMeshEvent.AFTER_DRAW);

      if (enables) {
        for (const enable of enables) {
          gl.enable(enable);
        }
      }

      if (disables) {
        for (const disable of disables) {
          gl.disable(disable);
        }
      }
    }
  }

  public recalc() {
    this.emit(GLMeshEvent.BEFORE_RECALC);

    for (const name in this._buffers) {
      if (Object.prototype.hasOwnProperty.call(this._buffers, name)) {
        this._buffers[name].update();
      }
    }
  }

  public get uniforms() {
    return this._uniforms;
  }

  public get buffers() {
    return this._buffers;
  }

  public create() {
    this._uniforms.projectionMatrix = {
      type: UniformType.MAT4,
      value: this.viewport.projection
    };

    this.program.create();

    for (const name in this._buffers) {
      if (Object.prototype.hasOwnProperty.call(this._buffers, name)) {
        this._buffers[name].create(this.viewport.gl);
      }
    }

    this.recalc();
    this.onCreate();
    this.created.resolve();

    this.animating = true;

    return this;
  }

  public destroy(viewport: Viewport) {
    this.animating = false;

    delete this._uniforms.projectionMatrix;

    this.program.destroy(viewport.gl);

    for (const name in this._buffers) {
      if (Object.prototype.hasOwnProperty.call(this._buffers, name)) {
        this._buffers[name].destroy(viewport.gl);
      }
    }

    this.onDestroy();
  }

  public uniform(
    nameOrValues: string | { [name: string]: number[] | number },
    value?: number[] | number
  ) {
    if (typeof nameOrValues === 'object') {
      for (const name in nameOrValues) {
        if (Object.prototype.hasOwnProperty.call(nameOrValues, name)) {
          this.uniform(name, nameOrValues[name]);
        }
      }

      return this;
    }

    let type = UniformType.FLOAT;

    if (value instanceof Array) {
      switch (value.length) {
        case 2: type = UniformType.VEC2; break;
        case 3: type = UniformType.VEC3; break;
        case 4: type = UniformType.VEC4; break;
      }
    }

    this._uniforms[nameOrValues] = { type, value };

    return this;
  }

  protected beforeDraw() {}
  protected afterDraw() {}
  public onCreate() {}
  public onDestroy() {}
}
