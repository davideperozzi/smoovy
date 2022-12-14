import { Observable, ObservableTarget, observe } from '../src';

function log<T extends ObservableTarget>(observable: Observable<T>) {
  observable.onChange(() => {
    if (observable.ref instanceof HTMLElement) {
      observable.ref.innerHTML = `<div style="position: sticky; top: 20px">
        Width: ${observable.width}px <br>
        Height: ${observable.height}px <br>
        Left: ${observable.left}px <br>
        Top: ${observable.top}px <br>
        Threshold: ${observable.visibilityThreshold} <br>
        Visible: ${observable.visible ? 'Yes' : 'No'}
      </div>`;
    } else {
      console.log(observable.ref, {
        width: observable.width,
        height: observable.height
      });
    }
  });

  return observable;
}

const element1 = log(observe(
  document.querySelector('[data-sample-element-1]') as HTMLElement,
  {
    resizeDetection: true,
    visibilityDetection: {
      threshold: 0.5
    }
  }
));

const element2 = log(observe(
  document.querySelector('[data-sample-element-2]') as HTMLElement,
  {
    resizeDetection: true,
    visibilityDetection: true,
    detectVisibilityOnce: true
  }
));

const viewport = log(observe(window, { resizeDetection: true }));


