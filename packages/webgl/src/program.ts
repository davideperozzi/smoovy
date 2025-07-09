import { UniformType, UniformValue } from './uniform';
import { createShader, uniformMethod, uniformValue, warnOnce } from './utils';

export interface ProgramAttrib {
  type: number;
  size: number;
  norm: boolean
  count: number;
  stride: number;
  offset: number;
  location: number;
  buffer: WebGLBuffer;
}

export class Program {
  private buffers: Record<string, WebGLBuffer> = {};
  private attribs: Record<string, ProgramAttrib> = {};
  private uniforms: Record<string, WebGLUniformLocation> = {};
  private vertex: WebGLShader;
  private fragment: WebGLShader;
  private _program: WebGLProgram;
  private bound = false;

  constructor(
    protected gl: WebGLRenderingContext,
    vertex: string,
    fragment: string
  ) {
    this.vertex = createShader(gl, gl.VERTEX_SHADER, vertex);
    this.fragment = createShader(gl, gl.FRAGMENT_SHADER, fragment);
    this._program = gl.createProgram()!;

    gl.attachShader(this._program, this.vertex);
    gl.attachShader(this._program, this.fragment);
    gl.linkProgram(this._program);

    if ( ! gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(this._program);

      throw new Error(`Error while creating shader program: ${info}`);
    }

    gl.detachShader(this.program, this.vertex);
    gl.detachShader(this.program, this.fragment);
    gl.deleteShader(this.vertex);
    gl.deleteShader(this.fragment);
  }

  bind() {
    this.gl.useProgram(this._program);

    this.bound = true;
  }

  unbind() {
    this.gl.useProgram(null);

    this.bound = false;
  }

  enableAttribs() {
    const gl = this.gl;
    let vertices = 0;

    for (const name in this.attribs) {
      const {
        buffer,
        size,
        location,
        count,
        type,
        stride,
        norm,
        offset
      } = this.attribs[name];

      if (location === -1) {
        warnOnce(`couldn't find attribute "${name}" in shader`);
        continue;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, type, norm, stride, offset);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      vertices += count;
    }

    return vertices;
  }

  uniform(name: string, value?: UniformValue, type?: UniformType, warn = true) {
    const gl = this.gl;

    if ( ! this.uniforms[name]) {
      this.uniforms[name] = gl.getUniformLocation(this._program, name)!;

      if ( ! this.uniforms[name]) {
        warnOnce(`couldn't find uniform ${name}`, warn);
      }
    }

    if (value && this.bound) {
      const parsedValue = uniformValue(value);
      const parsedMethod = uniformMethod(parsedValue, type);

      if ( ! parsedMethod) {
        warnOnce(`couldn't parse uniform method for ${name}`);
      } else {
        const fncName = `uniform${parsedMethod}`;
        const location = this.uniforms[name];

        if (parsedMethod.startsWith('Matrix')) {
          (gl as any)[fncName](location, false, parsedValue);
        } else {
          (gl as any)[fncName](location, parsedValue);
        }
      }
    } else if (value && ! this.bound) {
      warnOnce(`program not bound, can't set uniform ${name}`);
    }

    return this.uniforms[name];
  }

  attribute(
    name: string,
    data: WebGLBuffer | Float32Array,
    size = 3,
    count = data instanceof Float32Array ? data.length / size : 0,
    norm = false,
    type = this.gl.FLOAT,
    stride = 0,
    offset = 0
  ) {
    this.attribs[name] = {
      location: this.attribLoc(name),
      buffer: data instanceof Float32Array ? this.bufferData(name, data) : data,
      count,
      norm,
      offset,
      stride,
      size,
      type
    };
  }

  attribLoc(name: string) {
    return this.gl.getAttribLocation(this._program, name);
  }

  attribExists(name: string) {
    return this.attribLoc(name) !== -1;
  }

  bufferData(name: string, data: Float32Array) {
    const gl = this.gl;

    this.buffers[name] = this.buffers[name] || gl.createBuffer()!;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[name]);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return this.buffers[name];
  }

  get program() {
    return this._program;
  }

  destroy() {
    const gl = this.gl;

    for (const attrib of Object.values(this.attribs)) {
      gl.disableVertexAttribArray(attrib.location);
    }

    for (const name in this.buffers) {
      gl.deleteBuffer(this.buffers[name]);
    }

    this.attribs = {};
    this.buffers = {};
  }
}