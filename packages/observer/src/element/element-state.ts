import { Coordinate, Size } from '@smoovy/utils/m/dimension';
import { throttle } from '@smoovy/utils/m/throttle';

import { ElementObserver } from './element-observer';
import {
  ElementStateImpl, StateChangeListener, StateChangeObservable,
} from './element-state-impl';

export class ElementState implements ElementStateImpl {
  public size: Size = { width: 0, height: 0 };
  public offset: Coordinate = { x: 0, y: 0 };

  public constructor(
    public element: HTMLElement
  ) {
    ElementObserver.register(this);
  }

  public update() {
    ElementObserver.updateState(this);
  }

  public destroy() {
    ElementObserver.deregister(this);
  }

  public changed(
    listener: StateChangeListener,
    throttleTime: number = 0
  ): StateChangeObservable {
    if (throttleTime > 0) {
      listener = throttle(listener, throttleTime);
    }

    return ElementObserver.changed(this, listener);
  }
}
