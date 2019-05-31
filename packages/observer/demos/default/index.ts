import { demo } from '../../../../demos/demo';
import { ViewportObserver } from '../../src/viewport-observer';
import { ElementObserver, ElementState } from '../../src';

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
    const state = ElementObserver.observe(targetEl as HTMLElement);

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
