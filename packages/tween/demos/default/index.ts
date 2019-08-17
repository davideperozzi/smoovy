import { demo } from '../../../../demos/demo';
import { EasingImplementation } from '../../dist/typings/easing';
import { easings, Tween } from '../../src/index';

demo('counter', ({ counterEl }) => ({
  play: () => ({
    tween: Tween.fromTo(
      { value: 0 },
      { value: 100 },
      {
        duration: 1000,
        easing: easings.Linear.none,
        on: {
          update({ value })  {
            (counterEl as HTMLElement).textContent = value.toString();
          }
        }
      }
    )
  }),
  reset: ({ tween }) => tween.stop()
}));

demo('css-transform', ({ boxEl }) => ({
  play: () => ({
    tween: Tween.fromTo(
      { x: 0 },
      { x: 300 },
      {
        duration: 1000,
        easing: easings.Sine.out,
        on: {
          update({ x }) {
            (boxEl as HTMLElement).style.transform = `
              translate3d(${x}px, 0, 0)
            `;
          }
        }
      }
    )
  }),
  reset: ({ tween }) => tween.stop()
}));

demo('easings', ({ boxEls }) => ({
  init: () => {
    boxEls = boxEls as HTMLElement[];

    interface EasingElement {
      name: string;
      el: HTMLElement;
      fn: EasingImplementation;
    }

    const easingEls: EasingElement[] = [
      { name: 'Circ.out', fn: easings.Circ.out, el: boxEls[0] },
      { name: 'Expo.out', fn: easings.Expo.out, el: boxEls[1] },
      { name: 'Cubic.out', fn: easings.Cubic.out, el: boxEls[2] },
      { name: 'Quad.out', fn: easings.Quad.out, el: boxEls[3] },
      { name: 'Sine.out', fn: easings.Sine.out, el: boxEls[4] },
      { name: 'Quint.out', fn: easings.Quint.out, el: boxEls[5] },
      { name: 'Bounce.out', fn: easings.Bounce.out, el: boxEls[6] },
      { name: 'Back.out', fn: easings.Back.out, el: boxEls[7] },
    ];

    easingEls.forEach(easing => easing.el.textContent = easing.name);

    return { easingEls };
  },
  play: ({ easingEls }) => {
    return {
      tweens: easingEls.map((easing) => {
        return Tween.fromTo(
          { x: 0 },
          { x: 300 },
          {
            duration: 1000,
            easing: easing.fn,
            on: {
              update({ x }) {
                easing.el.style.transform = `translate3d(${x}px, 0, 0)`;
              }
            }
          }
        );
      })
    };
  },
  reset: ({ tweens }) => {
    tweens.forEach((tween: Tween) => tween.stop());
  }
}));

demo('pause-controls', ({ boxEl }) => ({
  init: () => ({
    tween: Tween.fromTo(
      { x: 0 },
      { x: 400 },
      {
        duration: 2500,
        paused: true,
        easing: easings.Sine.out,
        on: {
          update({ x }) {
            (boxEl as HTMLElement).style.transform = `
              translate3d(${x}px, 0, 0)
            `;
          }
        }
      }
    ),
  }),
  play: ({ tween }) => ({
    tween: tween.start()
  }),
  reset: ({ tween }) => {
    if (tween.complete) {
      tween.reset();
    }

    tween.start();
  },
  stop: ({ tween }) => tween.pause()
}));

demo('delayed', ({ boxEl }) => ({
  play: () => ({
    tween: Tween.fromTo(
      { x: 0 },
      { x: 300 },
      {
        delay: 500,
        duration: 1000,
        easing: easings.Sine.out,
        on: {
          update({ x }) {
            (boxEl as HTMLElement).style.transform = `
              translate3d(${x}px, 0, 0)
            `;
          },
          delay(passed) {
            (boxEl as HTMLElement).innerText = `${passed.toFixed(2)}ms`;
          }
        }
      }
    )
  }),
  reset: ({ tween }) => tween.stop()
}));

demo('progress', ({ boxEl }) => ({
  init: () => ({
    tween: Tween.fromTo(
      { x: 0 },
      { x: 300 },
      {
        duration: 5000,
        paused: true,
        easing: easings.Sine.out,
        on: {
          update({ x }) {
            (boxEl as HTMLElement).innerHTML = `
              ${(this.progress * 100).toFixed(2)}%
            `;
            (boxEl as HTMLElement).style.transform = `
              translate3d(${x}px, 0, 0)
            `;
          }
        }
      }
    )
  }),
  play: ({ tween }) => ({ tween: tween.reset().start() }),
  reset: ({ tween }) => tween.stop()
}));

demo('progress-anchor', ({ boxEl }) => ({
  play: () => {
    const box = boxEl as HTMLElement;
    const boxBounds = box.getBoundingClientRect();
    const parentBounds = box.parentElement.getBoundingClientRect();
    const duration = 5000;
    const easing = easings.Sine.out;

    return {
      tween: Tween.fromTo(
        { x: 0 },
        { x: parentBounds.width },
        {
          duration,
          easing,
          on: {
            update({ x }, progress) {
              const anchorChange = easing(
                duration * progress,
                0,
                boxBounds.width,
                duration
              );

              box.textContent = `${-anchorChange.toFixed(2)}px`;
              box.style.transform = `translate3d(
                ${x - anchorChange}px,
                0,
                0
              )`;
            }
          }
        }
      )
    };
  },
  reset: ({ tween }) => tween.stop()
}));

demo('seeking', ({ boxEl }) => ({
  tween: Tween.fromTo(
    { x: 0 },
    { x: 300 },
    {
      duration: 5000,
      paused: true,
      easing: easings.Sine.out,
      on: {
        update({ x }, progress) {
          (boxEl as HTMLElement).innerHTML = `
            ${(progress * 100).toFixed(2)}%
          `;
          (boxEl as HTMLElement).style.transform = `
            translate3d(${x}px, 0, 0)
          `;
        }
      }
    }
  ),
  play: () => ({
    interval: setInterval(() => {
      this.tween.duration = 300;
    }, 500)
  }),
  reset: ({ interval }) => clearInterval(interval)
}));
