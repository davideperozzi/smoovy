import { RouteChangeEvent } from './route';

export interface ActionArgs {
  root: HTMLElement;
  from: HTMLElement;
  to: HTMLElement;
  trigger: 'popstate' | 'user';
}

export abstract class RouterTransition {
  public abstract navStart(event: RouteChangeEvent): Promise<void>;
  public abstract navEnd(event: RouteChangeEvent): Promise<void>;
  public abstract beforeEnter(action: ActionArgs): Promise<void>;
  public abstract afterEnter(action: ActionArgs): Promise<void>;
  public abstract beforeLeave(action: ActionArgs): Promise<void>;
  public abstract afterLeave(action: ActionArgs): Promise<void>;
}

export async function processTransitions(
  stack: RouterTransition[],
  cb: (transition: RouterTransition) => Promise<any>
) {
  const transition = stack.shift();

  if (transition) {
    await cb(transition);
  }

  if (stack.length > 0) {
    await processTransitions(stack, cb);
  }
}