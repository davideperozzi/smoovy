export interface ActionArgs {
  root: HTMLElement;
  from: HTMLElement;
  to: HTMLElement;
  trigger: 'popstate' | 'user';
}

export abstract class RouterTransition {
  public abstract beforeEnter(action: ActionArgs): Promise<void>;
  public abstract afterEnter(action: ActionArgs): Promise<void>;
  public abstract beforeLeave(action: ActionArgs): Promise<void>;
  public abstract afterLeave(action: ActionArgs): Promise<void>;
}
