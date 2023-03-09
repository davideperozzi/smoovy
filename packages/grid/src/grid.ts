import { Coordinate, isNum } from '@smoovy/utils';

import { GridConfig } from './config';
import { GridData } from './data';
import { GridItem } from './item';
import { GridMesh } from './mesh';

export class Grid<T extends GridData> {
  private mesh: GridMesh;
  private items: GridItem<T>[] = [];
  private translation: Coordinate = { x: 0, y: 0 };

  constructor(
    private readonly config: GridConfig<T>
  ) {
    this.mesh = new GridMesh(config);

    this.fill();
    this.render();
  }

  render() {
    for (let i = 0, len = this.items.length; i < len; i++) {
      const item = this.items[i];

      item.x = this.mesh.x(item.grid.x, this.translation.x);
      item.y = this.mesh.y(item.grid.y, this.translation.y);

      item.render();
    }

    requestAnimationFrame(() => this.render());
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

      if (this.config.filter && ! this.config.filter(grid)) {
        return;
      }

      const item = new GridItem({
        index,
        root: this.config.root,
        data: this.config.data,
        grid: this.config.map ? this.config.map(grid) : grid,
        pad: { x: this.mesh.padSizeX, y: this.mesh.padSizeY },
        expand: this.config.expand,
        create: this.config.create,
        translate: this.config.translate
      });

      this.items.push(item);
    });
  }
}