import { ElementParallaxItem, ParallaxController } from '../../src';

const controller = new ParallaxController();

document.querySelectorAll<HTMLElement>('.image').forEach(element => {
  const image1Content = element.firstElementChild as HTMLElement;
  const image1Item = new ElementParallaxItem(
    element,
    {
      speed: .1,
      contained: image1Content,
      mapShift: (shift) => {
        return { x: shift.x, y: 0 };
      },
      on: {
        update: () => {
          console.log({
            left: image1Content.getBoundingClientRect().left,
            right: image1Content.getBoundingClientRect().right
          });
        }
      }
    }
  );

  controller.add(image1Item);
});

const update = () => {
  controller.update({
    scrollPosX: window.scrollX,
    scrollPosY: window.scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    contentWidth: document.body.offsetWidth,
    contentHeight: document.body.offsetHeight
  });
}

window.addEventListener('scroll', () => update());

[0, 10, 50, 100].forEach((ms) => {
  setTimeout(() => {
    controller.recalc();
    update();
  }, ms);
})

window.addEventListener('resize', () => {
  controller.recalc();
  update();
});
