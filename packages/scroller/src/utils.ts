import { Observable } from "@smoovy/observer";
import { Coordinate } from "@smoovy/utils";

export function getFocusPosition(
  target: HTMLElement,
  container: Observable<HTMLElement | Window>,
  ignore: HTMLElement[] = []
) {
  let activeEl = target;

  // we need to actively search for the focused element in a shadow root
  // since we can't really get dimensions from the shadow root and the
  // browser won't set the active element inside the shadow dom as target
  while (activeEl.shadowRoot && activeEl.shadowRoot.activeElement) {
    activeEl = activeEl.shadowRoot.activeElement as HTMLElement;
  }

  if ( ! (activeEl instanceof HTMLElement)) {
    return;
  }

  const ignored = ignore.map(el => el.contains(activeEl)).includes(true);

  if ( ! ignored && activeEl) {
    const bounds = activeEl.getBoundingClientRect();
    const targetSize = container.size;
    const position: Coordinate = { x: 0, y: 0 };
    let changed = false;

    if ( ! (bounds.right > 0 && bounds.left < targetSize.width)) {
      position.x = bounds.left - targetSize.width / 2;
      changed = true;
    }

    if ( ! (bounds.bottom > 0 && bounds.top < targetSize.height)) {
      position.y = bounds.top - targetSize.height / 2;
      changed = true;
    }

    if (changed) {
      return position;
    }
  }
}