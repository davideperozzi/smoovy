import { EventEmitter, EventListenerCb } from '@smoovy/event';
import { easings, Tween } from '@smoovy/tween';
import { Coordinate } from '@smoovy/utils';

import { ScrollerDom, ScrollerDomConfig } from './dom';
import { EasingImplementation } from 'tween/src/easing';

export type ScrollBehavior<C = any> = (config?: C) => ScrollBehaviorItem;
export type ScrollBehaviorItemDetach = (() => void)|void;
export interface ScrollBehaviorItem<S extends Scroller = Scroller> {
  name: string;
  attach: (scroller: S) => ScrollBehaviorItemDetach;
}

export interface ScrollerPosition {
  virtual: Coordinate;
  output: Coordinate;
}

export type DeltaTransformCallback = (delta: Coordinate) => Coordinate;
export type VirtualTransformCallback = (pos: Coordinate) => Coordinate;
export interface OutputTransformEvent {
  pos: Coordinate;
  step: (pos: Coordinate) => void;
}

export enum ScrollerEvent {
  INPUT = 'input',
  DELTA = 'delta',
  OUTPUT = 'output',
  RECALC = 'recalc',
  TRANSFORM_DELTA = '~delta',
  TRANSFORM_VIRTUAL = '~virtual',
  TRANSFORM_OUTPUT = '~output'
}

export class Scroller extends EventEmitter {
  private attached = false;
  private locks: string[] = [];
  private mutedEvents: ScrollerEvent[] = [];
  public dom: ScrollerDom;
  public availableBehaviors = new Map<string, ScrollBehaviorItem>();
  public attachedBehaviors = new Map<string, ScrollBehaviorItemDetach>();
  public position: ScrollerPosition = {
    output: { x: 0, y: 0 },
    virtual: { x: 0, y: 0 }
  };

  public constructor(
    domConfig: ScrollerDomConfig,
    behaviors: ScrollBehaviorItem[]
  ) {
    super();

    this.dom = new ScrollerDom(domConfig);

    behaviors.forEach(behavior => {
      this.availableBehaviors.set(behavior.name, behavior);
    });

    this.dom.on<Coordinate>(ScrollerEvent.RECALC, () => {
      this.updateDelta({ x: 0, y: 0 });
    });

    this.on<Coordinate>(ScrollerEvent.DELTA, (delta) => {
      if ( ! this.isLocked()) {
        this.updateDelta(delta);
      }
    });

    this.attach();
  }

  private attach() {
    if ( ! this.attached) {
      this.attached = true;

      this.dom.attach();
      this.availableBehaviors.forEach(behavior => {
        this.attachedBehaviors.set(behavior.name, behavior.attach(this));
      });
    }
  }

  public destroy() {
    if (this.attached) {
      this.attached = false;

      this.dom.detach();
      this.attachedBehaviors.forEach(detach => {
        if (typeof detach === 'function') {
          detach.call(this);
        }
      });
    }
  }

  public updateDelta<T extends Partial<Coordinate>>(delta: T) {
    this.emit<T>(
      ScrollerEvent.TRANSFORM_DELTA,
      delta,
      (newDelta) => {
        delta.x = newDelta.x;
        delta.y = newDelta.y;
      }
    );

    if (delta.x) {
      this.position.virtual.x -= delta.x;
    }

    if (delta.y) {
      this.position.virtual.y -= delta.y;
    }

    this.emit<Coordinate>(
      ScrollerEvent.TRANSFORM_VIRTUAL,
      this.position.virtual,
      (newPos) => {
        this.position.virtual.x = newPos.x;
        this.position.virtual.y = newPos.y;
      }
    );

    if (this.mutedEvents.includes(ScrollerEvent.TRANSFORM_OUTPUT)) {
      this.updateOutput(this.position.virtual);
    } else {
      this.emit<OutputTransformEvent>(
        ScrollerEvent.TRANSFORM_OUTPUT,
        {
          pos: this.position.output,
          step: (pos) => {
            if (this.mutedEvents.includes(ScrollerEvent.TRANSFORM_OUTPUT)) {
              this.updateOutput(pos);
            } else {
              this.updateOutput(pos);
            }
          }
        }
      );
    }
  }

  protected updateOutput(pos: Coordinate) {
    this.position.output.x = pos.x;
    this.position.output.y = pos.y;

    this.emit(ScrollerEvent.OUTPUT, pos);
  }

  public lock(name = 'default') {
    if ( ! this.locks.includes(name)) {
      this.locks.push(name);
    }
  }

  public unlock(name = 'default') {
    const index = this.locks.indexOf(name);

    if (index > -1) {
      this.locks.splice(index, 1);
    }
  }

  public isLocked() {
    return this.locks.length > 0;
  }

  protected muteEvents(events: ScrollerEvent[]) {
    events.forEach(event => {
      if ( ! this.mutedEvents.includes(event)) {
        this.mutedEvents.push(event);
      }
    });
  }

  protected unmuteEvents(events: ScrollerEvent[]) {
    events.forEach(event => {
      const index = this.mutedEvents.indexOf(event);

      if (index > -1) {
        this.mutedEvents.splice(index, 1);
      }
    });
  }

  public scrollTo(
    pos: Partial<Coordinate>,
    duration: number = 2000,
    easing: EasingImplementation = easings.Sine.out
  ) {
    this.muteEvents([
      ScrollerEvent.TRANSFORM_OUTPUT
    ]);

    Tween.fromTo(this.position.virtual, pos, {
      mutate: false,
      duration,
      easing,
      on: {
        update: (newPos) => {
          this.updateDelta({
            x: this.position.virtual.x - newPos.x,
            y: this.position.virtual.y - newPos.y
          });
        },
        complete: () => {
          this.unmuteEvents([
            ScrollerEvent.TRANSFORM_OUTPUT
          ]);
        }
      }
    });
  }

  public onScroll(cb: EventListenerCb<Coordinate>) {
    return this.on(ScrollerEvent.OUTPUT, cb);
  }

  public onDelta(cb: EventListenerCb<Coordinate>) {
    return this.on(ScrollerEvent.DELTA, cb);
  }
}
