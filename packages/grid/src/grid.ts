import { Coordinate, isNum } from '@smoovy/utils';
import { Ticker, TickerThread } from '@smoovy/ticker';

import { GridConfig } from './config';
import { GridData } from './data';
import { GridItem } from './item';
import { GridMesh } from './mesh';

export class Grid<T extends GridData> {
  private mesh: GridMesh;
  private items: GridItem<T>[] = [];
  private translation: Coordinate = { x: 0, y: 0 };
  private ticker?: Ticker;
  private thread?: TickerThread;

  constructor(
    private readonly config: GridConfig<T>
  ) {
    this.mesh = new GridMesh(config);

    if (this.config.autoFill !== false) {
      this.fill();
    }

    if (this.config.autoRender !== false) {
      this.ticker = new Ticker();
      this.thread = this.ticker.add(() => this.render());
    }
  }

  render() {
    for (let i = 0, len = this.items.length; i < len; i++) {
      const item = this.items[i];

      item.x = this.mesh.x(item.grid.x, this.translation.x);
      item.y = this.mesh.y(item.grid.y, this.translation.y);

      item.render();
    }
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
    this.mesh.fill((x, y, width, height, index) => {
      const grid = { x, y, width, height };

      if (this.config.item?.filter && ! this.config.item.filter(grid)) {
        return;
      }

      const item = new GridItem({
        index,
        items: this.items,
        root: this.config.root,
        data: this.config.data,
        grid: this.config.item?.map ? this.config.item.map(grid) : grid,
        pad: { x: this.mesh.padSizeX, y: this.mesh.padSizeY },
        expand: this.config.item?.expand,
        find: this.config.item?.find,
        create: this.config.item?.create,
        translate: this.config.item?.translate,
        collapse: this.config.item?.collapse
      });

      this.items.push(item);
    });
  }

  pause() {
    if (this.thread) {
      this.thread.kill();

      delete this.thread;
    }
  }

  resume() {
    if ( ! this.thread) {
      if ( ! this.ticker) {
        this.ticker = new Ticker();
      }

      this.thread = this.ticker.add(() => this.render());
    }
  }

  destroy() {
    if (this.ticker) {
      this.ticker.kill();
    }
  }
}