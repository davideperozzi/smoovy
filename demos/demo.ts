interface DemoElements {
  [name: string]: HTMLElement|HTMLElement[]
}

export interface DemoControls<T, R = any> {
  init?: () => T;
  play: (ctx: T) => R;
  reset?: (data: R) => void;
}

function injectControls<T, R>(
  demo: HTMLElement,
  controls: DemoControls<T, R>
) {
  const playBtn = document.createElement('button');
  const ctx = controls.init ? controls.init.call(undefined) : {} as T
  let data = {} as R;
  let firstPlay = true;

  playBtn.textContent = 'Play';

  playBtn.classList.add('demo-play-btn');
  playBtn.addEventListener('click', () => {
    new Promise((resolve, reject) => {
      if (controls.reset && ! firstPlay) {
        const resetRet: any = controls.reset.call(undefined, data);

        if (resetRet instanceof Promise) {
          resetRet.then(() => resolve(), () => reject());
        } else {
          resolve();
        }
      } else {
        resolve();
      }

    }).then(() => {
      firstPlay = false;
      data = controls.play.call(undefined, ctx);
    });
  }, false);

  demo.appendChild(playBtn);

  return demo;
}

export function demo<T, R = any>(
  name: string,
  cb: (elements: DemoElements) => DemoControls<T, R>
) {
  const selector = `smoovy-demo-item[data-name="${name}"]`;
  const element = document.querySelector(selector) as HTMLElement;

  if ( ! element) {
    throw new Error(`Can't find demo element "${name}" -> "${selector}".`);
  }

  const elementList = element.getAttribute('data-elements');
  const elementCollection: DemoElements = {};

  if (elementList) {
    const classList = elementList.split(',').map(cl => cl.trim());

    classList.forEach(cl => {
      let clName = cl.replace(/-([a-z])/g, (g: any) => g[1].toUpperCase());
      let subElements = null;

      if (cl.endsWith('[]')) {
        cl = cl.replace(/\[\]$/, '');
        clName = clName.replace(/\[\]$/, '');
        subElements = Array.from(
          element.querySelectorAll(`.${cl}`)
        ) as HTMLElement[];
      } else {
        subElements = element.querySelector(`.${cl}`) as HTMLElement;
      }

      elementCollection[
        `${clName}${subElements instanceof Array ? 'Els' : 'El'}`
      ] = subElements;
    });
  }

  return injectControls<T, R>(element, cb.call(undefined, elementCollection));
}
