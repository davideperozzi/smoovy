import { Observable, ObservableTarget } from './observable';
import { ObservableController } from './observable-controller';

export const defaultController = ObservableController.default;

export function observe<T extends ObservableTarget>(
  target: T,
  controller = defaultController
) {
  return controller.add(target);
}

export function unobserve<T extends ObservableTarget>(
  observable: Observable<T>,
  controller = defaultController
) {
  return controller.delete(observable);
}
