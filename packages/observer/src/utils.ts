import { Observable, ObservableConfig, ObservableTarget } from './observable';
import { ObservableController } from './observable-controller';

export const defaultController = ObservableController.default;

export function observe<T extends ObservableTarget>(
  target: T,
  config: Partial<ObservableConfig> = {}
) {
  return defaultController.add(target, config);
}

export function unobserve<T extends ObservableTarget>(
  observable: Observable<T>
) {
  return defaultController.delete(observable);
}
