import { isFunc, objectDeepMerge } from '@smoovy/utils';

import { GridConfig } from '../config';
import { GridData } from '../data';
import { Grid } from '../grid';
import { GridItem } from '../item';

export interface ImageGridData extends GridData {
  image: string;
}

export interface ImageGridConfig<
  T extends ImageGridData
> extends GridConfig<T> {
  image?: Partial<{
    onCreate?: (item: GridItem<T>, image: HTMLElement) => void | HTMLElement;
    onExpand?: (item: GridItem<T>, image: HTMLElement, data: T) => boolean;
    onLoad?: (item: GridItem<T>, image: HTMLElement, data: T) => boolean;
    selector?: string;
    noStyles?: boolean;
    autoLoad?: boolean;
    classes?: Partial<{
      cell: string;
      image: string;
      loading: string;
      loaded: string;
    }>;
  }>
}

export function imageGrid<T extends ImageGridData>(config: ImageGridConfig<T>) {
  const imageCache = new Map<string, true>();
  const handleLoad = (
    item: GridItem<T>,
    image: HTMLElement,
    data: T
  ) => {
    const classes = config.image?.classes;

    imageCache.set(data.image, true);
    item.element.classList.add(classes?.loaded || 'is-loaded');
    item.element.classList.remove(classes?.loading || 'is-loading');

    image.style.backgroundImage = `url(${data.image})`;

    if (isFunc(config.image?.onLoad)) {
      config.image?.onLoad(item, image, data);
    }
  };

  return new Grid<T>(objectDeepMerge({
    ...config,
    item: {
      create: (item, element) => {
        const image = document.createElement('div');

        if (config.image?.noStyles !== true) {
          image.style.width = `100%`;
          image.style.position = 'absolute';
          image.style.backgroundSize = 'cover';
          image.style.backgroundRepeat = 'no-repeat';
        }

        if (config.image?.classes && config.image?.classes.cell) {
          element.classList.add(config.image?.classes.cell);
        }

        if (isFunc(config.image?.onCreate)) {
          const retElement = config.image?.onCreate(item, image);

          if (retElement instanceof HTMLElement) {
            item.element.appendChild(retElement);

            return element;
          }
        }

        item.element.appendChild(image);

        return element;
      },
      expand: (item, data) => {
        const image = config.image?.selector
          ? item.element.querySelector<HTMLElement>(config.image.selector)
          : item.element.firstElementChild as HTMLElement;

        if (image) {
          if (config.image?.classes?.image) {
            image.classList.add(config.image.classes.image);
          }

          if (config.image?.noStyles !== true) {
            image.style.aspectRatio = `${data.width}/${data.height}`;
          }

          if (config.image?.autoLoad !== false) {
            if ( ! imageCache.has(data.image)) {
              const element = new Image();
              const classes = config.image?.classes;

              image.classList.add(classes?.loading || 'is-loading');

              element.onload = () => handleLoad(item, image, data);
              element.src = data.image;
            } else {
              handleLoad(item, image, data);
            }
          }

          if (config.image && isFunc(config.image?.onExpand)) {
            return config.image.onExpand(item, image, data);
          }

          return true;
        }

        return false;
      }
    }
  }, config));
}