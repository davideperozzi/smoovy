import { Coordinate, Size } from '@smoovy/utils/m/dimension';

export type StateChangeListener = (state: ElementStateImpl) => void;
export interface StateChangeObservable {
  remove: () => void;
}

export interface ElementStateImpl {
  element: HTMLElement;
  offset: Coordinate;
  size: Size;

  update: () => void;
  destroy: () => void;
  changed: (
    listener: StateChangeListener,
    throttleTime?: number
  ) => StateChangeObservable;
}
