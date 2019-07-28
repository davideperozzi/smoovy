import { demo } from '../../../../demos/demo';
import { ElementObserver } from '../../src';
import { ViewportObserver } from '../../src/viewport-observer';

demo('viewport', ({ dimensionEl }) => ({
  init: () => {
    ViewportObserver.changed(
      (state) => {
        (dimensionEl as HTMLElement).textContent = `
          ${state.width}x${state.height}
        `;
      }
    );
  }
}));

demo('viewportThrottle', ({ dimensionEl }) => ({
  init: () => {
    ViewportObserver.changed(
      (state) => {
        (dimensionEl as HTMLElement).textContent = `
          ${state.width}x${state.height}
        `;
      },
      500
    );
  }
}));

demo('element', ({ targetEl, pageOffsetEl, sizeEl }) => ({
  init: () => {
    const state = ElementObserver.default.observe(targetEl as HTMLElement);

    state.changed(() => {
      (pageOffsetEl as HTMLElement).textContent = `
        ${state.offset.x}x${state.offset.y}
      `;

      (sizeEl as HTMLElement).textContent = `
        ${state.size.width}x${state.size.height}
      `;
    });
  }
}));

demo('element-mutations', (
  { targetEl, triggerNodeEl, pageOffsetEl, sizeEl }
) => ({
  init: () => {
    const triggerNode = triggerNodeEl as HTMLElement;
    const parentEl = triggerNode.parentElement as HTMLElement;
    const state = ElementObserver.default.observe(targetEl as HTMLElement);

    state.changed(() => {
      (pageOffsetEl as HTMLElement).textContent = `
        ${state.offset.x}x${state.offset.y}
      `;

      (sizeEl as HTMLElement).textContent = `
        ${state.size.width}x${state.size.height}
      `;
    });

    return {
      triggerNode,
      parentEl
    };
  },
  play: ({ triggerNode, parentEl }) => {
    return setInterval(() => {
      if (parentEl.contains(triggerNode)) {
        parentEl.removeChild(triggerNode);
      } else {
        parentEl.prepend(triggerNode);
      }
    }, 1000);
  },
  stop: (interval) => {
    clearInterval(interval);
  }
}));
