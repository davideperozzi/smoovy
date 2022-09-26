import { listenCompose } from '@smoovy/event';
import { ObservableConfig, observe } from '../../src';

const config: ObservableConfig = {
  observeVisibility: true
};

const box1 = observe(document.querySelector('.box1') as HTMLElement, config);
const box2 = observe(document.querySelector('.box2') as HTMLElement, config);
const box3 = observe(document.querySelector('.box3') as HTMLElement, config);
const unlisten = listenCompose(
  // box1.onVisibilityChanged((visible) => console.log('box1', visible)),
  box2.onVisibilityChanged((state) => console.log('box2', state.visibility)),
  // box3.onVisibilityChanged((visible) => console.log('box3', visible)),
);

box1.onUpdate(() => {
  console.log('updated');
})
