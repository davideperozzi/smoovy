/* eslint-disable lines-between-class-members */
import { TweenController, TweenControllerConfig } from './controller';
import { fromTo, to } from './helper/tween';
import { DOMTweenProps } from './props';
import { SimpleTweenConfig } from './tween';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TimelineConfig extends
  Omit<TweenControllerConfig, 'duration' | 'initSeek'> {
  items?: Partial<TimelineItem>[];
}

export interface TimelineItemConfig {
  offset?: number;
}

export interface TimlineSideEffect {
  callback: () => void;
  item?: TimelineItem;
  config: TimelineItemConfig;
  called: boolean;
}

export type TimelineDynamicController = () => TweenController;

export interface TimelineItem {
  controller?: TweenController;
  dynamic?: TimelineDynamicController;
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
        } else if (item.dynamic) {
          this.add(item.dynamic, item.config);
        }
      }
    }

    if (config.autoStart !== false) {
      requestAnimationFrame(() => this.start());
    }
  }

  call(callback: () => void, config: TimelineItemConfig = {}) {
    this.sideEffects.push({
      callback,
      config,
      called: false,
      item: this.items[this.items.length-1],
    });

    return this;
  }

  clear() {
    this.reset();

    this.items.length = 0;
    this.sideEffects.length = 0;
    this._duration = 0;

    return this;
  }

  add(
    item: TweenController | TweenController[] | TimelineDynamicController,
    config: TimelineItemConfig = {}
  ) {
    if (typeof item === 'function') {
      this.items.push({ dynamic: item, config });
      return this;
    }

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

  /** @todo make more memory efficient: less arrays more floats */
  private updateDuration() {
    const vectors: [number, number][] = [];

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const controller = item.controller;

      if ( ! controller) {
        continue;
      }

      const config = item.config;
      const duration = controller.duration;
      const offset = config.offset || 0;

      if (i === 0) {
        vectors.push([ duration, duration ]);

        continue;
      }

      if (vectors.length === 0) {
        continue;
      }

      const [ edge, length ] = vectors[vectors.length-1];
      const gap = length * offset;

      vectors.push([ edge + gap + duration, duration ]);
    }

    this._duration = Math.max(...vectors.map(vector => vector[0]));
  }

  revealAllItems() {
    for (const item of this.items) {
      this.revealItem(item);
    }

    this.updateDuration();

    return this;
  }

  revealItem(item: TimelineItem): TimelineItem & {
    controller: TweenController
  } {
    if ( ! item.controller && item.dynamic) {
      item.controller = item.dynamic().override().reset();

      if (item.controller instanceof Timeline) {
        item.controller.revealAllItems();
      }

      this.updateDuration();
    }

    return item as any;
  }

  isDynamic() {
    return this.items.some(item => item.dynamic);
  }

  protected getStartMs(items: TimelineItem[], index: number) {
    let leftEdge = 0;

    for (let i = 0; i <= index; i++) {
      if (i - 1 < 0) {
        continue;
      }

      const item = this.revealItem(items[i-1]);
      const controller = item.controller;
      const offset = items[i].config.offset || 0;

      leftEdge += controller.duration + controller.duration * offset;
    }

    return leftEdge;
  }

  private callEffects(passed: number, effects: TimlineSideEffect[]) {
    for (const effect of effects) {
      const effectOffset = (effect.config.offset || 0);
      const controller = effect.item?.controller;
      const itemDuration = effect.item ? controller?.duration || 0 : 0;
      const triggerMs = itemDuration + itemDuration * effectOffset;

      if ( ! effect.called && passed >= triggerMs) {
        effect.callback();
        effect.called = true;
      }
    }
  }

  seek(ms: number, noDelay = false) {
    if ( ! this.preSeek(ms, noDelay)) {
      return this;
    }

    // Set the progress. Not that the duration is not fixed.
    // If the timeline contains dynamic items it'll change overtime
    // so the progress might jump. To prevent this use the `ms` which keeps
    // increasing constantly, without jumping. It might be not 100% accurate.
    // It can be +-16ms off, but it's good enough for most cases.
    this._progress = Math.min(ms, this.duration) / this.duration;

    this.callback(this.config.onSeek, [ms, this._progress]);

    // Process the delay, if fals is returned the delay is still in progress
    // and we don't need to process the tweens yet
    if ( ! this.seekDelay(ms, noDelay)) {
      return this;
    }

    ms -= noDelay ? 0 : this.delay;

    const items = this.items;
    let counter = 0;

    for (let i = 0, len = items.length; i < len; i++) {
      const item = this.revealItem(items[i]);
      const effects = this.sideEffects.filter(effect => effect.item === item);
      const startMs = this.getStartMs(items, i);
      const length = item.controller.duration;
      const endMs = startMs + length;
      const passed = ms - startMs;

      // Do not process zero length tweens. These would run forever
      if (length === 0) {
        continue;
      }

      // Sometimes the end of the controller is skipped, because ms is not
      // precise and updated on animation frame. This is the correction.
      // So simply put, if ms overshot the end of the controller, we seek
      // to the end of the controller manually as we would while ticking.
      if (ms > endMs) {
        if (item.controller.progress < 1) {
          item.controller.seek(length);
          this.callEffects(length, effects);
          counter++;
        }

        continue;
      }

      item.controller.seek(passed);
      this.callEffects(passed, effects);
      counter++;

      const nextItem = items[i+1];
      const nextOffset = nextItem ? nextItem.config.offset || 0 : 0;

      // If the next item is not in range yet, don't even process.
      // This allows for a more efficient and dynamic animation,
      // since we're revealing dynamic animations as we go
      if ( ! nextItem || endMs + nextOffset * length > ms) {
        break;
      }
    }

    // If the counter is 0, there are no more tweens to process, so we signal
    // a complete, stop and resolve the current timeline
    if (counter === 0) {
      this.stop();
      this.resolve();
      this.callback(this.config.onComplete);
      this.callListeners('onComplete');
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

    for (const { controller } of this.items) {
      if (controller) {
        controller.reverse();
      }
    }

    return this;
  }

  stop(silent = false) {
    super.stop();

    for (const { controller } of this.items) {
      if (controller) {
        controller.stop(silent);
      }
    }

    return this;
  }

  resetEffects() {
    for (const effect of this.sideEffects) {
      effect.called = false;
    }
  }

  reset(seek = 0, silent = false) {
    super.reset(seek, silent);

    const items = this.items.slice().reverse();

    for (const { controller } of items) {
      if (controller) {
        controller.reset(seek, silent);
      }
    }

    this.resetEffects();

    return this;
  }
}