import {
  ElementParallaxItem, ParallaxController, VectorParallaxItem,
} from '../../src';

// Create visible element
const element = document.createElement('div');

// Create parallax item
const state = { x: 100, y: 500, width: 300, height: 300 };
const controller = new ParallaxController();
const vectorItem = new VectorParallaxItem({
  speed: { x: 0, y: 0.2 },
  state: () => state,
  on: {
    update: (position, progress) => {
      element.textContent = `${position.y.toFixed(2)}`;
      element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    }
  }
});

const elementItem1 = new ElementParallaxItem(
  document.querySelector('.box1') as HTMLElement,
  { speed: 0.3 }
);

const elementItem2 = new ElementParallaxItem(
  document.querySelector('.box2') as HTMLElement,
  { speed: 0.01 }
);

controller.add(vectorItem);
controller.add(elementItem1);
controller.add(elementItem2);

element.style.position = 'absolute';
element.style.left = `${state.x}px`;
element.style.top = `${state.y}px`;
element.style.width = `${state.width}px`;
element.style.height = `${state.height}px`;
element.style.backgroundColor = 'red';
element.style.textAlign = `center`;
element.style.lineHeight = `${state.height}px`;

document.body.append(element);

window.addEventListener('scroll', () => {
  controller.update({
    scrollPosX: window.scrollX,
    scrollPosY: window.scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    contentWidth: document.body.offsetWidth,
    contentHeight: document.body.offsetHeight
  });
});
