import { Mesh, MeshConfig } from "../mesh";

interface PrimitiveConfig extends MeshConfig {
  geometry: {
    positions: Float32Array;
    normals?: Float32Array;
    indices?: Uint16Array;
    texcoord?: Float32Array;
    indexType?: 5121 | 5123 | 5125;
  };
}

export class Primitive<C extends PrimitiveConfig = PrimitiveConfig> extends Mesh<C> {
  updateGeometry() {
    super.updateGeometry();

    const {
      positions,
      normals,
      indices,
      texcoord,
      indexType
    } = this.config.geometry;

    this.program.setPositions(positions);

    if (normals) {
      this.program.setNormals(normals);
    }

    if (indices) {
      this.program.setIndices(indices);

      if (indexType) {
        this.program.setIndexType(indexType);
      }
    }

    if (texcoord) {
      this.program.setTextureCoords(texcoord);
    }
  }
}