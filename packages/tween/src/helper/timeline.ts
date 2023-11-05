import { DOMTweenProps, TweenProps } from '../props';
import { Timeline, TimelineConfig, TimelineItemConfig } from '../timeline';
import { SimpleTweenConfig } from '../tween';
import { fromTo, to } from './tween';

function timeline(config: TimelineConfig = {}) {
  return new Timeline(config);
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

export { timeline, staggerTo, staggerFromTo };