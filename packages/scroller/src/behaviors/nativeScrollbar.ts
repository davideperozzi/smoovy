import { listen, listenCompose } from '@smoovy/listener';
import { Browser } from '@smoovy/utils';

import { ScrollBehavior, ScrollerEvent } from '../core';

interface Config {
  /**
   * The target to set the scroll listeners on
   * Default: window
   */
  target?: HTMLElement | Window;

  /**
   * Whether to let the scrollbar emit delta events
   * Default: false
   */
  nativeHandler?: boolean;

  /**
   * Whether to scrol to the scrollbar position immediately
   * or use configured output position transformers.
   *
   * Only available when `nativeHandler = true`
   *
   * Default: true
   */
  immediate?: boolean;

  /**
   * The timeout (ms) used to detect that the user has finished scrolling.
   * Basically after `resetTimeout` -> (scrolling = false)
   *
   * Only available when `nativeHandler = true`
   *
   * Default: 100
   */
  resetTimeout?: number;
}

const defaultConfig: Config = {
  target: Browser.client ? window : undefined,
  resetTimeout: 100,
  nativeHandler: false,
  immediate: true
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    let locked = false;
    const restorePos = { x: 0, y: 0 };
    const contentSpan = document.createElement('div');
    const parentElement = scroller.dom.container.ref.parentElement;
    const updateSize = (height?: number) => {
      const wrapperHeight = scroller.dom.wrapper.height;

      contentSpan.style.height = `${height ?? wrapperHeight}px`;
    };

    updateSize();

    if (parentElement) {
      parentElement.append(contentSpan);
    }

    let scrolling = false;
    let dragging = false;
    let timeout: any;

    return listenCompose(
      () => contentSpan.remove(),
      cfg.target
        ? listen(cfg.target, 'scroll', (event) => {
            if (cfg.nativeHandler) {
              scroller.emit(ScrollerEvent.DELTA, {
                x: scroller.position.virtual.x - window.scrollX,
                y: scroller.position.virtual.y - window.scrollY
              });
            } else if ( ! scrolling) {
              dragging = true;

              scroller.scrollTo(
                { x: window.scrollX, y: window.scrollY },
                cfg.immediate
              );
            }
          })
        : undefined,
      !cfg.nativeHandler ? scroller.onVirtual((pos) => {
        if (cfg.target && ! dragging) {
          scrolling = true;

          cfg.target.scrollTo(pos.x, pos.y);
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          scrolling = false;
          dragging = false;
        }, cfg.resetTimeout);
      }) : undefined,
      scroller.on(ScrollerEvent.RECALC, () => {
        if ( ! scroller.isLocked()) {
          updateSize();
        }
      }),
      scroller.on(ScrollerEvent.LOCK, () => {
        if (scroller.isLocked() && ! locked) {
          locked = true;
          restorePos.x = scroller.position.output.x;
          restorePos.y = scroller.position.output.y;

          updateSize(0);
        } else if (locked) {
          locked = false;

          updateSize();
          scroller.scrollTo(restorePos, true);

          if (cfg.target && !cfg.nativeHandler) {
            cfg.target.scrollTo(restorePos.x, restorePos.y);
          }
        }
      })
    );
  };
};

export { Config as NativeScrollbarConfig };
export default behavior;
