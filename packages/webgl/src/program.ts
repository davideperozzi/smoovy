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
  target: GLenum;
}

export class Program {
  private indicesLen = 0;
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

  hasIndices() {
    return this.indicesLen > 0 && 'indices' in this.buffers;
  }

  bindAttribs() {
    const gl = this.gl;
    let total = 0;

    for (const name in this.attribs) {
      const {
        buffer,
        size,
        location,
        count,
        type,
        stride,
        norm,
        offset,
        target
      } = this.attribs[name];

      if (location === -1) {
        warnOnce(`couldn't find attribute "${name}" in shader`);
        continue;
      }

      gl.bindBuffer(target, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, type, norm, stride, offset);
      gl.bindBuffer(target, null);

      total += count;
    }

    return total;
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

  bindIndices() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    return this.indicesLen;
  }

  setIndices(data: number[] | Uint16Array) {
    const gl = this.gl;
    let bufferData = Array.isArray(data) ? new Uint16Array(data) : data;

    this.indicesLen = bufferData.length;

    this.bufferData('indices', bufferData, gl.ELEMENT_ARRAY_BUFFER);
  }

  setPositions(data: number[] | Float32Array, size = 3, count = true, name = 'a_position') {
    if (this.attribExists(name)) {
      const positions = Array.isArray(data) ? new Float32Array(data) : data;

      this.attribute(name, positions, size, count);
    }
  }

  setNormals(data: number[] | Float32Array, size = 3, name = 'a_normal') {
    if (this.attribExists(name)) {
      this.attribute(name, data, size, false);
    }
  }

  setTextureCoords(data: number[] | Float32Array, size = 2, name = 'a_texcoord') {
    if (this.attribExists(name)) {
      this.attribute(name, data, size, false);
    }
  }

  attribute(
    name: string,
    data: WebGLBuffer | Float32Array | Uint16Array,
    size = 3,
    count = false,
    norm = false,
    target = this.gl.ARRAY_BUFFER,
    type = this.gl.FLOAT,
    stride = 0,
    offset = 0
  ) {
    const dataIsArray = data instanceof Float32Array || data instanceof Uint16Array;
    const sizeLength = dataIsArray ? data.length / size : 0;

    this.attribs[name] = {
      location: this.attribLoc(name),
      buffer: dataIsArray ? this.bufferData(name, data) : data,
      count: count ? sizeLength : 0,
      norm,
      offset,
      stride,
      size,
      type,
      target,
    };
  }

  attribLoc(name: string) {
    return this.gl.getAttribLocation(this._program, name);
  }

  attribExists(name: string) {
    return this.attribLoc(name) !== -1;
  }

  bufferData(
    name: string,
    data: ArrayBufferView | ArrayBuffer,
    target: GLenum = this.gl.ARRAY_BUFFER
  ) {
    const gl = this.gl;

    this.buffers[name] = this.buffers[name] || gl.createBuffer()!;

    gl.bindBuffer(target, this.buffers[name]);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    gl.bindBuffer(target, null);

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