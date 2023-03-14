import { Coordinate, isDef, isNum, mod, Size } from '@smoovy/utils';

export enum GridMeshFit {
  WIDTH = 'w',
  HEIGHT = 'h',
  NONE = 'n'
}

export interface GridMeshConfig {
  size: number | { [size: number]: number };
  fit?: GridMeshFit;
  view?: Size;
  data?: Size[];
  pad?: number;
}

export interface GridCell extends Size, Coordinate {
  index: number;
}

export class GridMesh {
  private rowSize?: number;
  private colSize?: number;
  public padding: Coordinate = { x: 0, y: 0 };

  constructor(
    private config: GridMeshConfig,
  ) {}

  get fit() {
    return this.config.fit || GridMeshFit.WIDTH;
  }

  get size() {
    if (isNum(this.config.size)) {
      return this.config.size;
    }

    const keys = Object.keys(this.config.size).map(k => parseInt(k));
    const sizes = keys.sort((a, b) => a - b);
    const screen = this.fit === GridMeshFit.WIDTH
      ? this.view.width
      : this.view.height;

    for (let i = 0, len = sizes.length; i < len; i++) {
      if (screen < sizes[i]) {
        const prevSize = sizes[i - 1];

        return this.config.size[isDef(prevSize) ? prevSize : sizes[0]];
      }
    }

    return this.config.size[Math.max(...keys)];
  }

  get view() {
    return this.config.view || {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  get pad() {
    return this.config.pad || 2;
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

  recalc() {
    this.rowSize = undefined;
    this.colSize = undefined;
    this.padding.x = this.padSizeX;
    this.padding.y = this.padSizeY;
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

  fill(cb: (cell: GridCell) => void) {
    const colSize = this.getColSize();
    const colCount = this.getColCount();
    const rowSize = this.getRowSize();
    const rowCount = this.getRowCount();
    let index = 0;

    for (let y = -this.pad; y < rowCount + this.pad; y++) {
      for (let x = -this.pad; x < colCount + this.pad; x++) {
        cb({
          x,
          y,
          width: colSize,
          height: rowSize,
          index: index++
        });
      }
    }
  }
}