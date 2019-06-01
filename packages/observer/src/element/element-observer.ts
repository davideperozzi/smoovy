import { Browser } from '@smoovy/utils/m/browser';
import { getElementOffset } from '@smoovy/utils/m/element';

import { ViewportObservable, ViewportObserver } from '../viewport-observer';
import { ElementState } from './element-state';
import { ElementStateImpl, StateChangeListener } from './element-state-impl';

export interface StateChangeObservable {
  remove: () => void;
}

export class ElementObserver {
  private static lastRaf: number;
  private static attached = false;
  private static viewportObserver?: ViewportObservable;
  private static mutationObserver?: MutationObserver;
  private static changeListeners = new Map<
    ElementStateImpl,
    StateChangeListener
  >();
  public static states: ElementStateImpl[] = [];

  public static observe(element: ElementStateImpl['element']) {
    for (let i = 0, len = this.states.length; i < len; i++) {
      if (this.states[i].element === element) {
        return this.states[i];
      }
    }

    return new ElementState(element);
  }

  public static register(state: ElementStateImpl) {
    this.states.push(state);
    this.updateStateAsync(state);
    this.checkStates();
  }

  public static deregister(state: ElementStateImpl) {
    const index = this.states.indexOf(state);

    if (index > -1) {
      this.states.splice(index, 1);
      this.checkStates();
    }

    if (this.changeListeners.has(state)) {
      this.changeListeners.delete(state);
    }
  }

  public static updateRaf() {
    cancelAnimationFrame(this.lastRaf);

    this.lastRaf = requestAnimationFrame(() => this.update());
  }

  public static update() {
    for (let i = 0, len = this.states.length; i < len; i++) {
      this.updateState(this.states[i]);
    }
  }

  public static changed(
    state: ElementStateImpl,
    listener: StateChangeListener
  ): StateChangeObservable {
    if ( ! this.states.includes(state)) {
      throw new Error(
        `[smoovy/observer] element state not found or destroyed`
      );
    }

    this.changeListeners.set(state, listener);

    return {
      remove: () => this.changeListeners.delete(state)
    };
  }

  public static updateStateAsync(state: ElementStateImpl) {
    setTimeout(() => this.updateState(state));
  }

  public static updateState(state: ElementStateImpl) {
    const prevSum = this.getStateSum(state);

    this.updateOffset(state);
    this.updateSize(state);

    if (
      prevSum !== this.getStateSum(state) &&
      this.changeListeners.has(state)
    ) {
      const listener = this.changeListeners.get(state);

      if (listener) {
        listener.call(this, state);
      }
    }
  }

  private static getStateSum(state: ElementStateImpl) {
    return (
      state.offset.x + state.offset.y +
      state.size.width + state.size.height
    );
  }

  private static updateSize(state: ElementStateImpl) {
    const bounds = state.element.getBoundingClientRect();

    state.size.width = bounds.width;
    state.size.height = bounds.height;
  }

  private static updateOffset(state: ElementStateImpl) {
    const offset = getElementOffset(state.element);

    state.offset.x = offset.x;
    state.offset.y = offset.y;
  }

  private static attach() {
    this.attached = true;
    this.viewportObserver = ViewportObserver.changed(() => this.update());

    if (Browser.mutationObserver) {
      this.mutationObserver = new MutationObserver(() => this.updateRaf());

      this.mutationObserver.observe(
        document.documentElement,
        {
          attributes: true,
          childList: true,
          subtree: true
        }
      );
    }

    let domContentLoadedListener: EventListenerOrEventListenerObject;

    document.addEventListener(
      'DOMContentLoaded',
      domContentLoadedListener = () => {
        this.updateRaf();

        document.removeEventListener(
          'DOMContentLoaded',
          domContentLoadedListener
        );
      },
      false
    );

    this.updateRaf();
  }

  private static detach() {
    this.attached = false;

    if (this.viewportObserver) {
      this.viewportObserver.remove();
      this.viewportObserver = undefined;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
  }

  private static checkStates() {
    if (this.states.length > 0 && ! this.attached) {
      this.attach();
    }

    if (this.states.length === 0 && this.attached) {
      this.detach();
    }
  }
}
