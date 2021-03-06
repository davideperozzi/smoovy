import { Observable, ObservableTarget, ObservableEvent } from './observable';
import { ObservableController } from './observable-controller';

export const defaultController = ObservableController.default;
export function observe(
  target: ObservableTarget | Observable,
  controller = defaultController
) {
  return controller.add(target);
}

export function unobserve(
  observable: Observable,
  controller = defaultController
) {
  return controller.delete(observable);
}
