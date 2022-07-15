import { Coordinate } from '@smoovy/utils';

import { VertexAttrBuffer } from '../buffers';
import { segmentateSquare } from '../helpers';
import { GLMesh, GLMeshConfig } from '../mesh';
import { Program } from '../program';
import { mat4gs, mat4s, mat4ta } from '../utils/math';

export interface GLPlaneConfig extends GLMeshConfig {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  segments?: Coordinate | number;
  vertex?: string;
  fragment?: string;
}

export class GLPlane extends GLMesh {
  protected program: Program;
  protected _translation: Coordinate = { x: 0, y: 0 };

  public constructor(
    protected config: GLPlaneConfig
  ) {
    super(config);

    this.buffers.vertCoord = new VertexAttrBuffer(2);
    this.program = new Program(
      config.vertex || `
        attribute vec4 vertCoord;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vertCoord;
        }
      `,
      config.fragment ||  `
        precision highp float;
        uniform vec3 color;

        void main() {
          gl_FragColor = vec4(
            color.r / 255.0,
            color.g / 255.0,
            color.b / 255.0,
            1.0
          );
        }
      `
    );
  }

  public set x(pos: number) {
    this.config.x = pos;
  }

  public set y(pos: number) {
    this.config.y = pos;
  }

  public set width(size: number) {
    this.config.width = size;
  }

  public set height(size: number) {
    this.config.height = size;
  }

  public get x() {
    return this.config.x || 0;
  }

  public get y() {
    return this.config.y || 0;
  }

  public get width() {
    return this.config.width || 0;
  }

  public get height() {
    return this.config.height || 0;
  }

  public get scale() {
    const scaling = mat4gs(this.model);

    return {
      x: scaling[0],
      y: scaling[1]
    };
  }

  public get translation() {
    return this._translation;
  }

  public scaleTo(x: number, y: number) {
    const scaling = mat4gs(this.model);
    const scaleX = x / scaling[0];
    const scaleY = y / scaling[1];

    mat4s(this.model, [ scaleX, scaleY, 1 ]);
  }

  public translateTo(x: number, y: number) {
    if (this.viewport) {
      this._translation.x = x;
      this._translation.y = y;

      const coords = this.viewport.getClipsSpaceCoord(x, y);

      mat4ta(this.model, [ coords.x, coords.y ]);
    }
  }


  public get segments(): Coordinate {
    if (typeof this.config.segments === 'number') {
      return {
        x: this.config.segments,
        y: this.config.segments
      };
    }

    if (this.config.segments instanceof Object) {
      return this.config.segments;
    }

    return { x: 5, y: 5 };
  }

  public recalc() {
    super.recalc();

    if (this.viewport) {
      this.buffers.vertCoord.update(
        segmentateSquare(
          this.segments,
          this.viewport.getClipsSpaceSize(
            this.config.width || 0,
            this.config.height || 0
          )
        )
      );

      this.translateTo(
        this.config.x || 0,
        this.config.y || 0
      );
    }
  }
}
