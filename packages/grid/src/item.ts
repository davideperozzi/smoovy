import { Coordinate, isFunc } from '@smoovy/utils';

import { GridData } from './data';
import { GridCell } from './mesh';

export interface GridItemConfig<T extends GridData> {
  root: HTMLElement;
  data: T[];
  pad: Coordinate;
  cell: GridCell;
  items: GridItem<T>[];
  create?: (item: GridItem<T>, element: HTMLElement) => HTMLElement;
  expand?: (item: GridItem<T>, data: GridItemConfig<T>['data'][0]) => boolean;
  collapse?: (item: GridItem<T>) => boolean;
  find?: (
    item: GridItem<T>,
    data: GridItemConfig<T>['data'],
  ) => GridItemConfig<T>['data'][0];
  resize?: (item: GridItem<T>) => void;
  translate?: (item: GridItem<T>) => void;
}

export class GridItem<T extends GridData> {
  private reset = false;
  private expanded = false;
  private available = false;
  x = 0;
  y = 0;
  element: HTMLElement;
  data?: T;

  constructor(
    private readonly config: GridItemConfig<T>
  ) {
    this.element = document.createElement('div');

    this.element.style.position = 'absolute';
    this.element.style.left = '0';
    this.element.style.right = '0';

    if (isFunc(this.config.create)) {
      this.element = this.config.create(this, this.element);
    }
  }

  get cell() {
    return this.config.cell;
  }

  get siblings(): GridItem<T>[] {
    return this.config.items.filter(item => item !== this);
  }

  get width() {
    return this.cell.width;
  }

  get height() {
    return this.cell.height;
  }

  isExpanded() {
    return this.expanded;
  }

  isAvailable() {
    return this.available;
  }

  isOuterBounds() {
    const pad = this.config.pad;

    return (
      this.x < -pad.x * .5 || this.x > 1 + pad.x * .5 ||
      this.y < -pad.y * .5 || this.y > 1 + pad.y * .5
    );
  }

  isVisible() {
    return (
      this.x <= 1 && this.x + this.width >= 0 &&
      this.y <= 1 && this.y + this.height >= 0
    );
  }

  update(cell: GridCell) {
    this.config.cell = cell;
  }

  recalc() {
    this.resize();
  }

  find() {
    if (isFunc(this.config.find)) {
      return this.config.find(this, this.config.data);
    }

    return this.config.data[this.cell.index % this.config.data.length];
  }

  expand() {
    this.expanded = true;
    this.available = true;

    if (isFunc(this.config.expand)) {
      this.available = this.config.expand(this, this.find());
    }

    if (this.available) {
      this.resize();
      this.translate();
      this.config.root.appendChild(this.element);
    }
  }

  collapse() {
    this.expanded = false;
    this.available = false;

    let remove = true;

    if (isFunc(this.config.collapse)) {
      remove = this.config.collapse(this);
    }

    if (remove && this.config.root.contains(this.element)) {
      this.config.root.removeChild(this.element);
    }
  }

  translate() {
    if (isFunc(this.config.translate)) {
      this.config.translate(this);
    } else {
      this.element.style.transform = `translate3d(
        ${this.x * 100}vw,
        ${this.y * 100}vh,
        0
      )`;
    }
  }

  resize() {
    if (this.config.resize) {
      this.config.resize(this);
    } else {
      this.element.style.width = `${this.width * 100}vw`;
      this.element.style.height = `${this.height * 100}vh`;
    }
  }

  render() {
    const visible = this.isVisible();
    const expanded = this.isExpanded();
    const outerBounds = this.isOuterBounds();

    if (outerBounds && expanded && ! this.reset) {
      this.reset = true;

      this.expand();
    }

    if (visible && ! expanded) {
      this.expand();
    }

    if ( ! visible && expanded) {
      this.collapse();
    }

    if (visible && this.reset) {
      this.reset = false;
    }

    if ( ! outerBounds && this.expanded) {
      this.translate();
    }
  }

  destroy() {
    this.collapse();
  }
}
