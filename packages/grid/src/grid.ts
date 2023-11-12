import { Ticker, TickerTask } from '@smoovy/ticker';
import { Coordinate, isNum } from '@smoovy/utils';

import { GridConfig } from './config';
import { GridData } from './data';
import { GridItem } from './item';
import { GridCell, GridMesh } from './mesh';

export class Grid<T extends GridData> {
  readonly mesh: GridMesh;
  private _items: GridItem<T>[] = [];
  private translation: Coordinate = { x: 0, y: 0 };
  private task?: TickerTask;

  constructor(
    private readonly config: GridConfig<T>
  ) {
    this.mesh = new GridMesh(config);

    if (this.config.autoFill !== false) {
      this.fill();
    }

    if (this.config.autoRender !== false) {
      this.task = Ticker.main.add(() => this.render());
    }
  }

  get items() {
    return this._items;
  }

  render() {
    const colSize = this.mesh.getColSize();
    const rowSize = this.mesh.getRowSize();

    for (let i = 0, len = this._items.length; i < len; i++) {
      const item = this._items[i];
      let pos = { x: item.cell.x * colSize, y: item.cell.y * rowSize };

      if (this.config.item?.map) {
        pos = this.config.item.map(pos);
      }

      item.x = this.mesh.x(pos.x, this.translation.x);
      item.y = this.mesh.y(pos.y, this.translation.y);

      item.render();
    }
  }

  recalc() {
    const oldItems = this._items.slice();
    const newItems: GridItem<T>[] = [];

    this.items.length = 0;

    this.mesh.recalc();
    this.mesh.fill((cell) => {
      if (this.config.item?.filter && ! this.config.item.filter(cell)) {
        return;
      }

      const item = oldItems.find(item => (
        item.cell.x === cell.x && item.cell.y === cell.y
      ));

      if (item) {
        cell.index = item.cell.index;

        item.update(cell);
        newItems.push(item);
      } else {
        newItems.push(this.createItem(cell));
      }
    });

    oldItems.forEach(item => {
      if ( ! newItems.includes(item)) {
        item.destroy();
      }
    });

    this.items.push(...newItems);

    for (let i = 0, len = this._items.length; i < len; i++) {
      this.items[i].recalc();
    }

    this.render();
  }

  translate(pos: Partial<Coordinate>) {
    if (isNum(pos.x)) {
      this.translation.x = pos.x / this.config.view.width;
    }

    if (isNum(pos.y)) {
      this.translation.y = pos.y / this.config.view.height;
    }
  }

  fill() {
    this.mesh.fill((cell) => {
      if (this.config.item?.filter && ! this.config.item.filter(cell)) {
        return;
      }

      this.items.push(this.createItem(cell));
    });
  }

  createItem(cell: GridCell) {
    return new GridItem({
      cell,
      items: this.items,
      pad: this.mesh.padding,
      root: this.config.root,
      data: this.config.data,
      expand: this.config.item?.expand,
      find: this.config.item?.find,
      create: this.config.item?.create,
      translate: this.config.item?.translate,
      collapse: this.config.item?.collapse
    });
  }

  pause() {
    if (this.task) {
      this.task.kill();
      delete this.task;
    }
  }

  resume() {
    if ( ! this.task) {
      this.task = Ticker.main.add(() => this.render());
    }
  }

  destroy() {
    if (this.task) {
      this.task.kill();
      delete this.task;
    }

    this.items.forEach(item => item.destroy());
    this.items.length = 0;
  }
}