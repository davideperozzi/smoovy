import {
  Browser, Coordinate, getElementOffset, Size, throttle,
} from '@smoovy/utils';

export type StateChangeListener = (size: Size, offset: Coordinate) => void;
export type StateDestroyListener = () => void;
export interface StateChangeListenerRef {
  remove: () => void;
}

export class ElementState {
  public size: Size = { width: 0, height: 0 };
  public offset: Coordinate = { x: 0, y: 0 };
  private _destroyed = false;
  private changeListeners: StateChangeListener[] = [];
  private destroyListeners: StateDestroyListener[] = [];
  private lastSum = 0;

  public constructor(
    public element: HTMLElement
  ) {}

  public update(async = false) {
    if (async) {
      setTimeout(() => this.updateDimensions());
    } else {
      this.updateDimensions();
    }
  }

  public onDestroy(listener: StateDestroyListener) {
    this.destroyListeners.push(listener);
  }

  private updateDimensions() {
    this.updateSize();
    this.updateOffset();

    if (this.hasChanged()) {
      this.emitChanges();
    }
  }

  private emitChanges() {
    for (let i = 0, len = this.changeListeners.length; i < len; i++) {
      this.changeListeners[i].call(this, this.size, this.offset);
    }
  }

  private removeListener(listener: StateChangeListener) {
    this.changeListeners = this.changeListeners.filter(item => {
      return item !== listener;
    });
  }

  public destroy() {
    this._destroyed = true;

    for (let i = 0, len = this.destroyListeners.length; i < len; i++) {
      this.destroyListeners[i].call(this);
    }

    this.changeListeners = [];
    this.destroyListeners = [];
  }

  public get destroyed() {
    return this._destroyed;
  }

  public changed(
    listener: StateChangeListener,
    throttleTime: number = 0
  ) {
    if (throttleTime > 0) {
      listener = throttle(listener, throttleTime);
    }

    this.changeListeners.push(listener);

    const ref: StateChangeListenerRef = {
      remove: () => this.removeListener(listener)
    };

    return ref;
  }

  public updateSize() {
    if (Browser.client) {
      const bounds = this.element.getBoundingClientRect();

      this.size.width = bounds.width;
      this.size.height = bounds.height;
    } else {
      this.size.width = 0;
      this.size.height = 0;
    }
  }

  public updateOffset() {
    if (Browser.client) {
      const offset = getElementOffset(this.element);

      this.offset.x = offset.x;
      this.offset.y = offset.y;
    } else {
      this.offset.x = 0;
      this.offset.y = 0;
    }
  }

  public hasChanged() {
    const sum = (
      this.offset.x + this.offset.y +
      this.size.width + this.size.height
    );

    const changed = sum !== this.lastSum;

    this.lastSum = sum;

    return changed;
  }
}
