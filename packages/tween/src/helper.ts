import { setDomProps } from './dom';
import { DOMTweenProps, TweenProps } from './props';
import { Timeline, TimelineConfig, TimelineItemConfig } from './timeline';
import { Tween, TweenConfig } from './tween';

type SimpleTweenConfig<V extends TweenProps>
  = Omit<TweenConfig<V>, 'from' | 'to'>;

function to<V extends DOMTweenProps>(
  from: HTMLElement,
  to: Partial<V>,
  config?: SimpleTweenConfig<V>
): Tween<V>;
function to<V extends TweenProps = TweenProps>(
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
  dom: HTMLElement,
  from: Partial<V>,
  to: Partial<V>,
  config?: SimpleTweenConfig<V>
): Tween<V>;
function fromTo<V extends TweenProps>(
  dom: HTMLElement,
  from: V,
  to: Partial<V>,
  config: SimpleTweenConfig<V> = {}
) {
  return new Tween({ dom, from, to, ...config });
}

function timeline(config: TimelineConfig = {}) {
  return new Timeline(config);
}

function from() {
  throw new Error('Not implemented yet');
}

function set(dom: HTMLElement, props: Partial<DOMTweenProps>) {
  setDomProps(dom, props);

  return dom;
}

function staggerTo<T extends DOMTweenProps = DOMTweenProps>(
  dom: HTMLElement[] | NodeListOf<HTMLElement>,
  toProps: Partial<T>,
  config?: SimpleTweenConfig<T> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>,
) {
  return new Timeline({
    ...config?.timeline,
    items: Array.from(dom).map(el => ({
      controller: to(el, toProps, config),
      config: config?.stagger
    })),
  });
}

function staggerFromTo<T extends DOMTweenProps= DOMTweenProps>(
  dom: HTMLElement[] | NodeListOf<HTMLElement>,
  fromProps: Partial<T>,
  toProps: Partial<T>,
  config?: SimpleTweenConfig<T> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>,
) {
  return new Timeline({
    ...config?.timeline,
    items: Array.from(dom).map(el => ({
      controller: fromTo(el, fromProps, toProps, config),
      config: config?.stagger
    })),
  });
}

export const tween = {
  to,
  fromTo,
  timeline,
  from,
  set,
  staggerTo,
  staggerFromTo
};