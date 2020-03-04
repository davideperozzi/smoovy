import { ParallaxController, VectorParallaxItem } from '../../src';

// Create visible element
const element = document.createElement('div');

// Create parallax item
const state = { x: 100, y: 1800, width: 500, height: 500 };
const controller = new ParallaxController();
const vectorItem = new VectorParallaxItem({
  speed: { x: 0, y: 0.5 },
  offset: { x: 0.5, y: 0.5 },
  state: () => state,
  on: {
    update: (position, progress) => {
      element.textContent = `${position.y.toFixed(2)}`;
    }
  }
});

controller.add(vectorItem);


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
