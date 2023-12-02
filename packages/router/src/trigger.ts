import { Unlisten, listen, listenCompose } from "@smoovy/listener";
import { queryElAll } from "@smoovy/utils";
import { hrefIsValid } from "./utils";

export class Trigger {
  private listeners = new Map<HTMLElement, Unlisten>();

  constructor(
    private selector: string,
    private callback?: (
      url: string,
      target: HTMLElement,
      type: 'hover' | 'click'
    ) => void,
  ) {
    this.update();
  }

  update(scope: HTMLElement = document.documentElement) {
    for (const [element] of this.listeners) {
      if ( ! document.documentElement.contains(element)) {
        this.remove(element);
      }
    }

    queryElAll(this.selector, scope).forEach(element => {
      if ( ! this.listeners.has(element)) {
        this.add(element);
      }
    });
  }

  add(trigger: HTMLElement) {
    this.listeners.set(trigger, listenCompose(
      listen(trigger, 'click', (event) => {
        event.preventDefault();

        const target = event.currentTarget as HTMLElement;

        if (target && this.callback) {
          const url = target.getAttribute('href') || target.dataset.routeUrl;

          if (url && hrefIsValid(url)) {
            this.callback(url, target, 'click');
          }
        }
      }),
      listen(trigger, 'mouseenter', (event) => {
        const target = event.currentTarget as HTMLElement;

        if (target && this.callback) {
          const url = target.getAttribute('href') || target.dataset.routeUrl;

          if (url && hrefIsValid(url)) {
            this.callback(url, target, 'hover');
          }
        }
      })
    ));
  }

  remove(element: HTMLElement) {
    const trigger = this.listeners.get(element);

    if (trigger) {
      trigger();
      this.listeners.delete(element);
    }
  }

  clear() {
    for (const unlisten of this.listeners.values()) {
      unlisten();
    }

    this.listeners.clear();
  }
}