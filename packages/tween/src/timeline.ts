import { TweenController, TweenControllerConfig } from './controller';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TimelineConfig extends Omit<TweenControllerConfig, 'duration'> {
  items?: Partial<TimelineItem>[];
}

export interface TimelineItemConfig {
  offset?: number;
}

export interface TimelineItem {
  controller: TweenController;
  config: TimelineItemConfig;
}

export class Timeline extends TweenController<TimelineConfig> {
  readonly items: TimelineItem[] = [];
  private timelineReversed = false;

  constructor(
    protected config: TimelineConfig
  ) {
    super(config);

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

  add(controller: TweenController, config: TimelineItemConfig = {}) {
    controller.override().pause();

    if (typeof config.offset !== 'undefined') {
      config.offset = Math.min(Math.max(config.offset, -1), 1);
    }

    if (this.timelineReversed && ! controller.reversed) {
      controller.reverse();
    }

    this.items.push({ controller, config });
    this.updateDuration();

    return this;
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
    let duration = 0;

    for (let i = 0, len = this.items.length; i < len; i++) {
      const prevItem = this.items[i - 1];
      const { controller, config } = this.items[i];
      let offset = 0;

      if (prevItem && config.offset) {
        offset = prevItem.controller.duration * config.offset;
      }

      duration += controller.duration + offset;
    }

    this._duration = duration;
  }

  protected process(eased: number) {
    const maxDuration = this.duration - this.delay;
    const totalTime = maxDuration * eased;
    const reversed = this.timelineReversed;
    const maxItems = this.items.length;
    let currentTime = 0;

    for (
      let i = reversed ? maxItems-1 : 0;
      reversed ? i >= 0 : i < maxItems;
      reversed ? i-- : i++
    ) {
      const neighbour = reversed ? this.items[i + 1] : this.items[i - 1];
      const { controller, config } = this.items[i];
      const duration = controller.duration;
      let offset = 0;

      if (neighbour && config.offset) {
        offset = neighbour.controller.duration * config.offset;
      }

      controller.seek((totalTime - (currentTime + offset)) / duration);

      currentTime += duration + offset;
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

  reset() {
    super.reset();

    for (const { controller } of this.items) {
      controller.reset();
    }

    return this;
  }
}