import { isFunc } from '@smoovy/utils';

import { GridConfig } from '../config';
import { GridData } from '../data';
import { Grid } from '../grid';
import { GridItem } from '../item';

export interface ImageGridData extends GridData {
  image: string;
}

export interface ImageGridConfig<T extends ImageGridData> extends GridConfig<T> {
  onCreate?: (item: GridItem<T>, image: HTMLElement) => void;
  onExpand?: (item: GridItem<T>, image: HTMLElement, data: T) => boolean;
}

export function imageGrid<T extends ImageGridData>(config: ImageGridConfig<T>) {
  return new Grid({
    create: (item, element) => {
      const image = document.createElement('div');

      image.style.width = `100%`;
      image.style.position = 'absolute';
      image.style.backgroundSize = 'cover';
      image.style.backgroundRepeat = 'no-repeat';

      if (isFunc(config.onCreate)) {
        config.onCreate(item, image);
      }

      item.element.appendChild(image);

      return element;
    },
    expand: (item, data) => {
      const image = item.element.firstElementChild as HTMLElement;

      if (image) {
        image.style.aspectRatio = `${data.width}/${data.height}`;
        image.style.backgroundImage = `url(${data.image})`;

        if (isFunc(config.onExpand)) {
          return config.onExpand(item, image, data);
        }

        return true;
      }

      return false;
    },
    ...config
  });
}