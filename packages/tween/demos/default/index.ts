import { Tween, easings } from "../../src/index";
import { demo } from '../../../../demos/demo';
import { EasingImplementation } from '../../dist/typings/easing';

demo('counter', ({ counterEl }) => ({
  play: () => ({
    tween: Tween.fromTo(
      { value: 0 },
      { value: 100 },
      {
        duration: 1000,
        easing: easings.Linear.none,
        update({ value })  {
          (counterEl as HTMLElement).textContent = value.toString();
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
        update({ x }) {
          (boxEl as HTMLElement).style.transform = `translate3d(${x}px, 0, 0)`;
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
    };

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
            update({ x }) {
              easing.el.style.transform = `translate3d(${x}px, 0, 0)`;
            }
          }
        )
      })
    };
  },
  reset: ({ tweens }) => {
    tweens.forEach((tween: Tween) => tween.stop());
  }
}));
