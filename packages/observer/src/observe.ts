import { Observable, ObserveController, ObserveTarget } from './controller';

export function observe(
  target: ObserveTarget,
  controller = ObserveController.default
) {
  return controller.add(target);
}

export function unobserve(observable: Observable) {
  if (observable.controller) {
    return observable.controller.delete(observable);
  }

  return false;
}
