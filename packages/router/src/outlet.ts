import { EventEmitter } from '@smoovy/event';

import { ActionArgs, RouterTransition } from './transition';

export enum RouterOutletEvent {
  CONTENT_BEFORE_ENTER_START = 'contentbeforeenterstart',
  CONTENT_BEFORE_ENTER_END = 'contentbeforeenterend',
  CONTENT_AFTER_ENTER_START = 'contentafterenterstart',
  CONTENT_AFTER_ENTER_END = 'contentafterenterend',
  CONTENT_BEFORE_LEAVE_START = 'contentbeforelavestart',
  CONTENT_BEFORE_LEAVE_END = 'contentbeforelaveend',
  CONTENT_AFTER_LEAVE_START = 'contentafterleavestart',
  CONTENT_AFTER_LEAVE_END = 'contentafterleaveend'
}

export class RouterOutlet extends EventEmitter {
  private activeAction?: ActionArgs;
  protected root: HTMLElement;

  public constructor(
    protected selector: string
  ) {
    super();

    const rootEl = document.documentElement.querySelector(selector);

    if ( ! rootEl) {
      throw new Error(`Element with selector "${selector}" not found`);
    }

    if ( ! (rootEl instanceof HTMLElement)) {
      throw new Error(
        `Element with selector "${selector}" needs to be typeof HTMLElement`
      );
    }

    this.root = rootEl;
  }

  private async processTransitions(
    stack: RouterTransition[],
    cb: (transition: RouterTransition) => Promise<any>
  ) {
    const transition = stack.shift();

    if (transition) {
      await cb(transition);
    }

    if (stack.length > 0) {
      await this.processTransitions(stack, cb);
    }
  }

  public async update(
    payload: HTMLElement,
    transitions: RouterTransition[] = [],
    trigger: ActionArgs['trigger'] = 'user'
  ) {
    const toRoot = payload.querySelector(this.selector);

    if ( ! toRoot) {
      throw new Error(
        `Child with selector "${this.selector}" not found in payload`
      );
    }

    const action = {
      root: this.root,
      from: this.root.firstElementChild as HTMLElement,
      to: toRoot.firstElementChild as HTMLElement,
      trigger
    };

    if ( ! action.to || ! action.from) {
      throw new Error(
        `The root element needs to contain exactly one child`
      );
    }

    this.activeAction = action;
    const event = { ...action };

    this.emit(RouterOutletEvent.CONTENT_BEFORE_ENTER_START, event);

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.beforeEnter(action);
    });

    if (this.activeAction !== action) {
      return;
    }

    this.emit(RouterOutletEvent.CONTENT_BEFORE_ENTER_END, event);

    if ( ! this.root.contains(action.to)) {
      this.root.appendChild(action.to);
    }

    this.emit(RouterOutletEvent.CONTENT_AFTER_ENTER_START, event);

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.afterEnter(action);
    });

    if (this.activeAction !== action) {
      return;
    }

    this.emit(RouterOutletEvent.CONTENT_AFTER_ENTER_END, event);
    this.emit(RouterOutletEvent.CONTENT_BEFORE_LEAVE_START, event);

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.beforeLeave(action);
    });

    if (this.activeAction !== action) {
      return;
    }

    this.emit(RouterOutletEvent.CONTENT_BEFORE_LEAVE_END, event);

    if (this.root.contains(action.from)) {
      this.root.removeChild(action.from);
    }

    this.emit(RouterOutletEvent.CONTENT_AFTER_LEAVE_START, event);

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.afterLeave(action);
    });

    this.emit(RouterOutletEvent.CONTENT_AFTER_LEAVE_END, event);

    if (this.activeAction === action) {
      delete this.activeAction;
    }
  }
}
