import { EventEmitter, EventListenerCb } from '@smoovy/event';
import { Size, Coordinate, getElementOffset } from '@smoovy/utils';

export type ObservableTarget = HTMLElement | Window;
export interface ObservableRect extends Size, Coordinate {}
export interface ObservablePrepos {
  above: boolean;
  below: boolean;
  left: boolean;
  right: boolean;
  inside: boolean;
}

export enum ObservableEvent {
  WILL_UPDATE = 'will-update',
  UPDATE = 'update',
  WILL_ATTACH = 'will-attach',
  ATTACH = 'attach',
  WILL_DETACH = 'will-delete',
  DETACH = 'detach'
}

export class Observable extends EventEmitter {
  public bounds: ObservableRect = { x: 0, y: 0, width: 0, height: 0 };
  public offset: ObservableRect = { x: 0, y: 0, width: 0, height: 0 };

  public constructor(
    public readonly target: ObservableTarget
  ) {
    super();
  }

  public onUpdate(listener: EventListenerCb) {
    return this.on(ObservableEvent.UPDATE, listener);
  }

  public onAttach(listener: EventListenerCb) {
    return this.on(ObservableEvent.ATTACH, listener);
  }

  public onDetach(listener: EventListenerCb) {
    return this.on(ObservableEvent.DETACH, listener);
  }

  public update() {
    this.emit(ObservableEvent.WILL_UPDATE);

    if (this.target instanceof Window) {
      const size = { width: window.innerWidth, height: window.innerHeight };

      this.bounds.width = size.width;
      this.bounds.height = size.height;
      this.offset.width = size.width;
      this.offset.height = size.height;
    } else {
      const bounds = this.target.getBoundingClientRect();
      const offset = getElementOffset(this.target);

      this.bounds.x = bounds.left;
      this.bounds.y = bounds.top;
      this.bounds.width = bounds.width;
      this.bounds.height = bounds.height;
      this.offset.x = offset.x;
      this.offset.y = offset.y;
      this.offset.width = this.target.offsetWidth;
      this.offset.height = this.target.offsetHeight;
    }

    this.emit(ObservableEvent.UPDATE);

    return this;
  }

  public prepos(
    position: Coordinate,
    size: Size,
    padding: Coordinate = { x: 0, y: 0 }
  ) {
    const offset = { ...this.offset };
    const prep = {
      above: offset.y + padding.y + offset.height < position.y,
      below: offset.y - padding.y > position.y + size.height,
      left: offset.x + padding.x + offset.width < position.x,
      right: offset.x - padding.x > position.x + size.width,
    };

    return {
      ...prep,
      inside: !prep.above && !prep.below && !prep.right && !prep.left
    };
  }
}
