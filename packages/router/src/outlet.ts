import { RouterTransition, ActionArgs } from './transition';

export class RouterOutlet {
  private activeAction?: ActionArgs;
  protected root: HTMLElement;

  public constructor(
    protected selector: string
  ) {
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

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.beforeEnter(action);
    });

    if (this.activeAction !== action) {
      return;
    }

    if ( ! this.root.contains(action.to)) {
      this.root.appendChild(action.to);
    }

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.afterEnter(action);
    });

    if (this.activeAction !== action) {
      return;
    }

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.beforeLeave(action);
    });

    if (this.activeAction !== action) {
      return;
    }

    if (this.root.contains(action.from)) {
      this.root.removeChild(action.from);
    }

    await this.processTransitions(transitions.slice(), (transition) => {
      return transition.afterLeave(action);
    });

    if (this.activeAction === action) {
      delete this.activeAction;
    }
  }
}
