import { mod, Size } from '@smoovy/utils';

export enum GridMeshFit {
  WIDTH = 'w',
  HEIGHT = 'h',
  NONE = 'n'
}

export interface GridMeshConfig {
  fit?: GridMeshFit;
  view?: Size;
  data?: Size[];
  pad?: number;
  size: number;
}

export class GridMesh {
  private rowSize?: number;
  private colSize?: number;

  constructor(
    private config: GridMeshConfig,
  ) {}

  get fit() {
    return this.config.fit || GridMeshFit.WIDTH;
  }

  get size() {
    return this.config.size;
  }

  get view() {
    return this.config.view || {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  get pad() {
    return this.config.pad || 4;
  }

  get padSizeX() {
    return this.pad * this.getColSize();
  }

  get padSizeY() {
    return this.pad * this.getRowSize();
  }

  get data() {
    return this.config.data || [];
  }

  get viewRatioWidth() {
    return this.view.width / this.view.height;
  }

  get viewRatioHeight() {
    return this.view.height / this.view.width;
  }

  update() {
    this.rowSize = undefined;
    this.colSize = undefined;
  }

  repeat(pos: number, translate = 0, padding = 0, size = 0) {
    return mod(pos + padding - translate, size + 2 * padding) - padding;
  }

  x(pos: number, translate = 0) {
    const colSize = this.getColSize();
    const maxCols = 1 / colSize;
    const offset = this.fit === GridMeshFit.HEIGHT
      ? (Math.ceil(maxCols) - maxCols) * colSize
      : 0;

    return this.repeat(pos, translate, this.pad * colSize, 1 + offset);
  }

  y(pos: number, translate = 0) {
    const rowSize = this.getRowSize();
    const maxRows = 1 / rowSize;
    const offset = this.fit === GridMeshFit.WIDTH
      ? (Math.ceil(maxRows) - maxRows) * rowSize
      : 0;

    return this.repeat(pos, translate, this.pad * rowSize, 1 + offset);
  }

  getColCount() {
    if (this.fit === GridMeshFit.WIDTH || this.fit === GridMeshFit.NONE) {
      return this.size;
    }

    const colSize = this.getColSize();

    if (colSize === 0) {
      return this.size;
    }

    return Math.ceil(1 / colSize);
  }

  getRowCount() {
    if (this.fit === GridMeshFit.HEIGHT || this.fit === GridMeshFit.NONE) {
      return this.size;
    }

    const rowSize = this.getRowSize();

    if (rowSize === 0) {
      return this.size;
    }

    return Math.ceil(1 / rowSize);
  }

  getColSize(): number {
    if (this.colSize !== undefined) {
      return this.colSize;
    }

    if (this.fit === GridMeshFit.WIDTH || this.fit === GridMeshFit.NONE) {
      this.colSize = 1 / this.size;

      return this.colSize;
    }

    const ratio = this.viewRatioWidth;
    const rowSize = this.getRowSize();

    this.colSize = Math.max(
      ...this.data.map(item => (rowSize * (item.width / item.height)) / ratio),
      0
    );

    return this.colSize;
  }

  getRowSize(): number {
    if (this.rowSize !== undefined) {
      return this.rowSize;
    }

    if (this.fit === GridMeshFit.HEIGHT || this.fit === GridMeshFit.NONE) {
      this.rowSize = 1 / this.size;

      return this.rowSize;
    }

    const ratio = this.viewRatioHeight;
    const colSize = this.getColSize();

    this.rowSize = Math.max(
      ...this.data.map(item => (colSize * (item.height / item.width)) / ratio),
      0
    );

    return this.rowSize;
  }

  fill(cb: (
    x: number,
    y: number,
    width: number,
    height: number,
    i: number
  ) => void) {
    const colSize = this.getColSize();
    const colCount = this.getColCount();
    const rowSize = this.getRowSize();
    const rowCount = this.getRowCount();
    let index = 0;

    for (let y = -this.pad; y < rowCount + this.pad; y++) {
      for (let x = -this.pad; x < colCount + this.pad; x++) {
        cb(x * colSize, y * rowSize, colSize, rowSize, index++);
      }
    }
  }
}