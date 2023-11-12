import { TweenController, TweenControllerConfig } from '../controller';
import { DOMTweenProps, TweenProps } from '../props';
import { SimpleTweenConfig, Tween } from '../tween';

function to<V extends DOMTweenProps>(
  from: HTMLElement,
  to: Partial<V>,
  config?: SimpleTweenConfig<V>
): Tween<V>;
function to<V extends object>(
  from: V,
  to: Partial<V>,
  config?: SimpleTweenConfig<V>
): Tween<V>;
function to<V extends TweenProps>(
  from: V,
  to: V,
  config: SimpleTweenConfig<V> = {}
) {
  return new Tween({ from, to, ...config });
}

function fromTo<V extends DOMTweenProps>(
  target: HTMLElement,
  from: Partial<V>,
  to: Partial<V>,
  config?: SimpleTweenConfig<V>
): Tween<V>;
function fromTo<V extends object>(
  target: V,
  from: Partial<V>,
  to: Partial<V>,
  config?: SimpleTweenConfig<V>
): Tween<V>;
function fromTo<V extends TweenProps>(
  target: any,
  from: V,
  to: Partial<V>,
  config: SimpleTweenConfig<V> = {}
) {
  return new Tween({ target, from, to, ...config });
}

function from() {
  throw new Error('Not implemented yet');
}

function noop() {
  return new TweenController({ duration: 0.001 }).start();
}

function delay(duration = 100, config: TweenControllerConfig = {}) {
  return new TweenController({ duration, ...config }).start();
}

export { fromTo, to, from, noop, delay };