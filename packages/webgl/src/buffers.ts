export enum BufferType {
  ARRAY_BUFFER = 1,
  ELEMENT_ARRAY_BUFFER = 2
}

export abstract class Buffer {
  protected buffer?: WebGLBuffer | null;
  protected gl?: WebGLRenderingContext;
  protected data: Float32Array = new Float32Array();

  public constructor(
    public readonly size = 2,
    public readonly type = BufferType.ARRAY_BUFFER,
  ) {}

  public get len() {
    return this.data.length;
  }

  public get count() {
    return this.len;
  }

  public update(data: Float32Array | number[] = this.data) {
    if ( ! this.gl || ! this.buffer) {
      console.warn('Can\'t update buffer without context');
      return;
    }

    if (data instanceof Float32Array) {
      this.data = data;
    } else {
      this.data = new Float32Array(data);
    }

    this.bind();
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.STATIC_DRAW);
  }

  public bind() {
    if (this.gl && this.buffer) {
      this.gl.bindBuffer(
        this.type === BufferType.ARRAY_BUFFER
          ? this.gl.ARRAY_BUFFER
          : this.gl.ELEMENT_ARRAY_BUFFER,
        this.buffer
      );
    }
  }

  public create(gl: WebGLRenderingContext) {
    this.gl = gl;

    if (this.buffer) {
      throw new Error('Buffer already attached');
    }

    this.buffer = gl.createBuffer();
  }

  public destroy(gl: WebGLRenderingContext) {
    if (gl && this.buffer) {
      gl.deleteBuffer(this.buffer);
      this.buffer = undefined;
    }
  }
}

export class TextureAttrBuffer extends Buffer {
  public constructor() {
    super(2, BufferType.ARRAY_BUFFER);
  }

  public get count() {
    return 0;
  }
}

export class VertexAttrBuffer extends Buffer {
  public constructor(
    public readonly size = 3
  ) {
    super(size, BufferType.ARRAY_BUFFER);
  }

  public get count() {
    return this.len / this.size;
  }
}

