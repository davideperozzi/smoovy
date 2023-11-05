/* eslint-disable lines-between-class-members */
import { TweenController, TweenControllerConfig } from './controller';
import { fromTo, to } from './helper/tween';
import { DOMTweenProps, TweenProps } from './props';
import { SimpleTweenConfig } from './tween';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TimelineConfig extends Omit<TweenControllerConfig, 'duration'> {
  items?: Partial<TimelineItem>[];
}

export interface TimelineItemConfig {
  offset?: number;
}

export interface TimlineSideEffect {
  callback: () => void;
  config: TimelineItemConfig;
  called: boolean;
  item?: TimelineItem
}

export interface TimelineItem {
  controller: TweenController;
  config: TimelineItemConfig;
}

export class Timeline extends TweenController<TimelineConfig> {
  readonly items: TimelineItem[] = [];
  private sideEffects: TimlineSideEffect[] = [];
  private timelineReversed = false;

  constructor(
    protected config: TimelineConfig
  ) {
    super(config);

    this._duration = 0;

    if (config.reversed) {
      this.reverse();
    }

    if (config.items) {
      for (const item of config.items) {
        if (item.controller) {
          this.add(item.controller, item.config);
        }
      }
    }
  }

  call(callback: () => void, config: TimelineItemConfig = {}) {
    this.sideEffects.push({
      item: this.items[this.items.length-1],
      called: false,
      callback,
      config,
    });

    return this;
  }

  add(
    item: TweenController | TweenController[],
    config: TimelineItemConfig = {}
  ) {
    const controllers = Array.isArray(item) ? item : [item];

    for (let i = 0, len = controllers.length; i < len; i++) {
      const controller = controllers[i].override().pause().reset();
      const itemConfig = { ...config };

      if (this.timelineReversed && ! controller.reversed) {
        controller.reverse();
      }

      if (i > 0) {
        itemConfig.offset = -1;
      }

      if (typeof itemConfig.offset !== 'undefined') {
        itemConfig.offset = Math.min(Math.max(itemConfig.offset, -1), 1);
      }

      this.items.push({ controller, config: itemConfig });
    }

    this.updateDuration();

    return this;
  }

  to<V extends DOMTweenProps>(
    from: HTMLElement,
    to: Partial<V>,
    config?: SimpleTweenConfig<V> & TimelineItemConfig
  ): Timeline;
  to<V extends object>(
    from: V,
    to: Partial<V>,
    config?: SimpleTweenConfig<V> & TimelineItemConfig
  ): Timeline;
  to(target: any, props: Partial<any>, config?: any) {
    return this.add(to(target, props, config), config);
  }

  fromTo<V extends DOMTweenProps>(
    target: HTMLElement,
    from: Partial<V>,
    to: Partial<V>,
    config?: SimpleTweenConfig<V> & TimelineItemConfig
  ): Timeline;
  fromTo<V extends object>(
    target: V,
    from: Partial<V>,
    to: Partial<V>,
    config?: SimpleTweenConfig<V> & TimelineItemConfig
  ): Timeline;
  fromTo(
    target: any,
    fromProps: Partial<any>,
    toProps: Partial<any>,
    config?: any
  ) {
    return this.add(fromTo(target, fromProps, toProps, config), config);
  }

  remove(controller: TweenController) {
    const index = this.items.findIndex(item => item.controller === controller);

    if (index !== -1) {
      this.items.splice(index, 1);
      this.updateDuration();
    }

    return this;
  }

  private updateDuration() {
    let highestEdge = 0;

    for (let i = 0; i < this.items.length; i++) {
      const controller = this.items[i].controller;
      const config = this.items[i].config;
      const duration = controller.duration;
      const offset = config.offset || 0;
      const prevItem = this.items[i-1];

      if ( ! prevItem) {
        highestEdge = duration;
        continue;
      }

      const prevDuration = prevItem.controller.duration;
      const currentGap = prevDuration * offset;
      const currentEdge = highestEdge + currentGap + duration;

      if (currentEdge > highestEdge) {
        highestEdge = currentEdge;
      }
    }

    this._duration = highestEdge;
  }

  process(eased: number) {
    const totalTime = (this.duration - this.delay) * eased;
    const reversed = this.timelineReversed;
    const maxItems = this.items.length;
    let currentTime = 0;

    for (
      let i = reversed ? maxItems-1 : 0;
      reversed ? i >= 0 : i < maxItems;
      reversed ? i-- : i++
    ) {
      let offset = 0;
      const neighbour = reversed ? this.items[i + 1] : this.items[i - 1];
      const { controller, config } = this.items[i];
      const duration = controller.duration;
      const effects = this.sideEffects.filter(effect => {
        return effect.item === this.items[i];
      });

      if (neighbour && config.offset) {
        offset = neighbour.controller.duration * config.offset;
      }

      const seekTime = totalTime - (currentTime + offset);

      if (effects.length > 0) {
        for (const effect of effects) {
          if (
            ! effect.called &&
            seekTime >= duration + duration * (effect.config.offset || 0)
          ) {
            effect.called = true;
            effect.callback();
          }
        }
      }

      controller.seek(seekTime);

      currentTime += duration + offset;
    }

    return this;
  }

  protected beforeStart() {
    this.resetEffects();

    for (const effect of this.sideEffects.filter(effect => !effect.item)) {
      effect.callback();
    }
  }

  reverse() {
    this.timelineReversed = !this.timelineReversed;

    if (this.items) {
      for (const { controller } of this.items) {
        controller.reverse();
      }
    }

    return this;
  }

  resetEffects() {
    for (const effect of this.sideEffects) {
      effect.called = false;
    }
  }

  reset() {
    super.reset();

    for (const { controller } of this.items) {
      controller.reset();
    }

    this.resetEffects();

    return this;
  }
}