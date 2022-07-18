import { Buffer, VertexAttrBuffer } from './buffers';

export enum UniformType {
  MAT2 = 1,
  MAT3 = 2,
  MAT4 = 4,
  VEC2 = 8,
  VEC3 = 16,
  VEC4 = 32,
  FLOAT = 64,
  INT = 128
}

export enum UniformGroups {
  NUM = UniformType.FLOAT | UniformType.INT,
  VEC = UniformType.VEC2 | UniformType.VEC3 | UniformType.VEC4,
  MAT = UniformType.MAT2 | UniformType.MAT3 | UniformType.MAT4
}

export interface Uniform<V = any> {
  type: UniformType;
  value: V;
}

export class Program {
  protected program?: WebGLProgram;
  protected vertexShader?: WebGLShader;
  protected fragmentShader?: WebGLShader;
  protected attribLocations = new Map<string, number>();
  protected uniformLocations = new Map<string, WebGLUniformLocation>();
  protected uniformValueCache = new Map<string, Float32Array>();
  public buffers = new Set<VertexAttrBuffer>();

  public constructor(
    protected vertexSource: string,
    protected fragmentSource: string
  ) {}

  public create(gl: WebGLRenderingContext) {
    this.program = gl.createProgram()!;

    this.vertexShader = this.createShader(
      gl,
      gl.VERTEX_SHADER,
      this.vertexSource
    );

    this.fragmentShader = this.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      this.fragmentSource
    );

    /**
     * @todo Create check if program is already set up.
     * If so, don't attach shaders again, only re-link.
     */

    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);
    gl.linkProgram(this.program);

    if ( ! gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(this.program);

      throw new Error(`Error while creating shader program: ${info}`);
    }
  }

  private registerAttrib(
    gl: WebGLRenderingContext,
    name: string
  ) {
    if ( ! this.program) {
      throw new Error('Program not initialized yet');
    }

    const location = gl.getAttribLocation(this.program, name);

    this.attribLocations.set(name, location);

    return location;
  }

  public updateAttrib(gl: WebGLRenderingContext, name: string, buffer: Buffer) {
    let location = this.attribLocations.get(name);

    if ( ! location) {
      location = this.registerAttrib(gl, name);
    }

    buffer.bind();
    gl.vertexAttribPointer(location, buffer.size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);

    return buffer.count;
  }

  private registerUniform(
    gl: WebGLRenderingContext,
    name: string
  ) {
    if ( ! this.program) {
      throw new Error('Program not initialized yet');
    }

    /** @todo check if uniform location was retrieved successfully */
    const location = gl.getUniformLocation(this.program, name)!;

    this.uniformLocations.set(name, location);

    return location;
  }

  public updateUniform(
    gl: WebGLRenderingContext,
    name: string,
    uniform: Uniform
  ) {
    let value = uniform.value;
    const cacheEnabled = ! (UniformGroups.NUM & uniform.type);
    let location = this.uniformLocations.get(name);
    let valueCache = cacheEnabled ? this.uniformValueCache.get(name) : null;

    if ( ! location) {
      location = this.registerUniform(gl, name);
    }

    if ( ! valueCache && cacheEnabled) {
      let count = 0;

      if (typeof value === 'object' && ! (value instanceof Array)) {
        count = Object.keys(value).length;
      } else if (typeof value.length !== 'undefined') {
        count = value.length;
      }

      const fillValue: number[] = [];

      for (let i = 0; i < count; i++) {
        fillValue.push(0);
      }

      valueCache = new Float32Array(fillValue);

      this.uniformValueCache.set(name, valueCache);
    }

    if (valueCache && typeof value === 'object' && ! (value instanceof Array)) {
      if (typeof value.x === 'number') valueCache[0] = value.x;
      if (typeof value.y === 'number') valueCache[1] = value.y;
      if (typeof value.z === 'number') valueCache[2] = value.z;
      if (typeof value.w === 'number') valueCache[3] = value.w;
    }

    if (valueCache && typeof value.length !== 'undefined') {
      for (let i = 0, len = value.length; i < len; i++) {
        valueCache[i] = value[i];
      }
    }

    if (cacheEnabled) {
      value = valueCache;
    }

    if (UniformGroups.MAT & uniform.type) {
      const fncName = `uniformMatrix${UniformType[uniform.type].slice(-1)}fv`;

      (gl as any)[fncName](location, false, value);
    } else if (UniformGroups.VEC & uniform.type) {
      const number = UniformType[uniform.type].slice(-1);
      const precision = UniformType.INT & uniform.type ? 'i' : 'f';
      const fncName = `uniform${number}${precision}v`;

      (gl as any)[fncName](location, value);
    } else if (UniformGroups.NUM & uniform.type) {
      const precision = UniformType.INT & uniform.type ? 'i' : 'f';
      const fncName = `uniform1${precision}`;

      (gl as any)[fncName](location, value);
    }
  }

  public destroy(gl: WebGLRenderingContext) {
    if (this.program) {
      gl.deleteProgram(this.program);
    }

    if (this.vertexShader) {
      gl.deleteShader(this.vertexShader);
    }

    if (this.fragmentShader) {
      gl.deleteShader(this.fragmentShader);
    }

    this.attribLocations.forEach(location => {
      gl.disableVertexAttribArray(location);
    });

    this.attribLocations.clear();
  }

  public use(gl: WebGLRenderingContext) {
    if ( ! this.program) {
      throw new Error('Program not ready yet');
    }

    gl.useProgram(this.program);
  }

  protected createShader(
    gl: WebGLRenderingContext,
    type: GLenum,
    source: string
  ) {
    const shader = gl.createShader(type);

    if ( ! shader) {
      throw new Error('Failed to create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if ( ! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);

      gl.deleteShader(shader);

      throw new Error(`Shader compile failed: ${info}`);
    }

    return shader;
  }
}
