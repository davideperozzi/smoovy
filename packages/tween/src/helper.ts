import { TweenController } from './controller';
import { setDomProps } from './dom';
import { DOMTweenProps, TweenProps } from './props';
import { Timeline, TimelineConfig, TimelineItemConfig } from './timeline';
import { Tween, TweenConfig } from './tween';

type SimpleTweenConfig<V extends (TweenProps | object)>
  = Omit<TweenConfig<V>, 'from' | 'to'>;

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

function timeline(config: TimelineConfig = {}) {
  return new Timeline(config);
}

function from() {
  throw new Error('Not implemented yet');
}

function set<V extends DOMTweenProps>(
  target: HTMLElement,
  props: Partial<V>
): TweenController;
function set<V extends object>(
  target: V,
  props: Partial<V>
): TweenController;
function set<V>(target: any, props: Partial<V>) {
  const controller = new TweenController({
    duration: 0.001,
    onStart: () => setNow(target, props),
  });

  return controller;
}

function setNow<V extends DOMTweenProps>(
  target: HTMLElement,
  props: Partial<V>
): typeof tween;
function setNow<V extends object>(
  target: V,
  props: Partial<V>
): typeof tween;
function setNow<V>(target: any, props: Partial<V>) {
  if (target instanceof HTMLElement) {
    setDomProps(target, props as Partial<DOMTweenProps>);
  } else {
    for (const key in props) {
      target[key as keyof V] = props[key as keyof V] as any;
    }
  }

  return tween;
}

function staggerTo<V extends DOMTweenProps>(
  targets: HTMLElement[] | NodeListOf<HTMLElement>,
  props: Partial<V>,
  config?: SimpleTweenConfig<V> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>
): Timeline;
function staggerTo<V extends object>(
  targets: V[],
  props: Partial<V>,
  config?: SimpleTweenConfig<V> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>
): Timeline;
function staggerTo<V extends TweenProps>(
  targets: any,
  props: Partial<V>,
  config?: SimpleTweenConfig<V> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>,
) {
  return new Timeline({
    ...config?.timeline,
    items: Array.from(targets).map(target => {
      const stagger: TimelineItemConfig = {
        offset: typeof config?.stagger?.offset !== 'undefined'
          ? -1 + config.stagger.offset
          : -1
      };

      return {
        controller: to(target as any, props, config as any),
        config: stagger
      }
    }),
  });
}

function staggerFromTo<V extends DOMTweenProps>(
  targets: HTMLElement[] | NodeListOf<HTMLElement>,
  fromProps: Partial<V>,
  toProps: Partial<V>,
  config?: SimpleTweenConfig<V> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>
): Timeline;
function staggerFromTo<V extends object>(
  targets: V[],
  fromProps: Partial<V>,
  toProps: Partial<V>,
  config?: SimpleTweenConfig<V> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>
): Timeline;
function staggerFromTo<T extends DOMTweenProps= DOMTweenProps>(
  targets: any,
  fromProps: Partial<T>,
  toProps: Partial<T>,
  config?: SimpleTweenConfig<T> & Partial<{
    timeline: TimelineConfig,
    stagger: TimelineItemConfig
  }>,
) {
  return new Timeline({
    ...config?.timeline,
    items: Array.from(targets).map(target => {
      const stagger: TimelineItemConfig = {
        offset: typeof config?.stagger?.offset !== 'undefined'
          ? -1 + config.stagger.offset
          : -1
      };

      return {
        controller: fromTo(target as any, fromProps, toProps, config),
        config: stagger
      }
    }),
  });
}

export const tween = {
  to,
  fromTo,
  timeline,
  from,
  set,
  setNow,
  staggerTo,
  staggerFromTo
};