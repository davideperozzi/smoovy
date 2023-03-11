import { Coordinate, Size } from '@smoovy/utils';

import { GridData } from './data';
import { GridItem, GridItemConfig } from './item';
import { GridMeshFit } from './mesh';

export interface GridConfig<T extends GridData> {
  /**
   * The number of cells to render per viewport. It will use the fit method
   * to determine how many cells and rows are required.
   *
   * If the fit of the grid is `width`, then size `4` will tell the grid to
   * render 4 columns into the viewport. The height of each row is then
   * determined by the highest ratio of the data you provided the grid with.
   * If you want to have 4 columns and  4 rows you need to set the fit method to
   * `none`.
   */
  size: number;

  /**
   * The size of the viewport. Most of the time you want this to be the size
   * of the window, so
   *
   * `{ width: window.innerWidth, height: window.innerHeight }`
   *
   * But you can also use this to render a grid into a smaller container.
   * You have to update this object "from the outisde". The grid will not manage
   * this size for you, since it doesn't know when the size of the container
   * changes.
   */
  view: Size;

  /**
   * The root element of the grid. All items will be appended to this element.
   */
  root: HTMLElement;

  /**
   * All items available. Data structure should be derived from `GridData`.
   * To ensure that the data structure is correct, and the ratio handled
   * correctly.
   */
  data: T[];

  /**
   * Whether to start rendering on RAF or disable it to allow calling of the
   * rendering methid manually. This is useful if you want to render the grid
   * on a specific event.
   *
   * Default = true
   */
  autoRender?: boolean;

  /**
   * Whether to fill the grid on creation. If this is disable, you have to call
   * `fill()` manually. This is useful if you want to fill the grid on a
   * specific event.
   *
   * Default = true
   */
  autoFill?: boolean;

  /**
   * How to adjust the size of each item (tile). Since we don't want to have
   * items overlapping each other, we're finding the largest tile and scale
   * all other tiles to that size. Inside this tile you can place the "real"
   * content, which will scale accordingly to it's ratio.
   *
   * @default `GridMeshFit.WIDTH`
   */
  fit?: GridMeshFit;

  /**
   * This will be used to render offset items in order to allow loading and
   * unloading of items. This is especially useful for infinite scrolling.
   * It ensures that there's no flickering when loading new items.
   *
   * @default `4`
   */
  pad?: number;

  /**
   * Configurations related to the item
   */
  item?: {
    /**
     * Remap the coordiantes of each cell on the grid. This is useful if you
     * want to change the position of the items a bit or go crazy with different
     * repeating patterns.
    */
    map?: (grid: Coordinate & Size) => Coordinate & Size;

    /**
     * Filter out items from the grid. This is useful if you want to render
     * only a subset of the items. This happens "on fill", so items you discard
     * will stay aways from the dom.
     */
    filter?: (grid: Coordinate & Size) => boolean;

    /**
     * This will be called when the item is created. Here you can define how
     * the item should look like. You can also use this to modify the structure
     * of the item created.
     */
    create?: (item: GridItem<T>, element: HTMLElement) => HTMLElement;

    /**
     * The find method is used to find the data for the current item being
     * expanded. This will determin how the item will be rendered and with
     * what content.
     *
     * Default = `return data[index % data.length]`
     */
    find?: (
      item: GridItem<T>,
      data: GridItemConfig<T>['data']
    ) => GridItemConfig<T>['data'][0];

    /**
     * This will be called when the item has the opportunity to change it's
     * data and therefore it's contnet. This will happen when the item is not
     * visible to the user. So you could for example randomize the cells contnet.
     * and each time the item gets visible again you would end up with different
     * data
     */
    expand?: (item: GridItem<T>, data: GridItemConfig<T>['data'][0]) => boolean;

    /**
     * The item will collapse if it's outer bounds and before it's being
     * removed from the DOM. The position will be still tracked virtually.
     * This is used to minimize the dom nodes renderd under the root node.
     *
     * @returns true if the item should be removed from the dom
     * @default () => true
     */
    collapse?: (item: GridItem<T>) => boolean;

    /**
     * This will be called when the new translation of the grid is applied
     * to the item, therefore moving it's position. Here you can define how you
     * want to make this new position manifest itself. For example you could
     * use this to just translate the item element to it's new position via CSS
     * transforms.
     *
     * @default It will translate with `transform: translate3d(item.x, item.y, 0)`
     */
    translate?: (item: GridItem<T>) => void;
  }
}