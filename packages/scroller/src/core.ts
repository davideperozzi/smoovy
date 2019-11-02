import { EasingImplementation } from 'tween/src/easing';

import {
  EventEmitter, EventListenerCb, listenCompose, Unlisten,
} from '@smoovy/event';
import { Ticker } from '@smoovy/ticker';
import { easings, Tween, TweenOptions } from '@smoovy/tween';
import { Coordinate, isNum } from '@smoovy/utils';

import { ScrollerDom, ScrollerDomConfig, ScrollerDomEvent } from './dom';

export type ScrollBehavior<C = any> = (config?: C) => ScrollBehaviorItem;
export type ScrollBehaviorItemDetach = (() => void)|void;
export type ScrollBehaviorItem<S extends Scroller = Scroller> =
  (scroller: S) => ScrollBehaviorItemDetach;

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

export interface TweenToEvent {
  pos: Partial<Coordinate>;
  options: Partial<
    Pick<TweenOptions<any>, 'duration' | 'easing'> &
    { force: boolean }
  >;
}

export interface ScrollToEvent {
  pos: Partial<Coordinate>;
  skipOutputTransform: boolean;
}

export enum ScrollerEvent {
  DELTA = 'delta',
  OUTPUT = 'output',
  RECALC = 'recalc',
  TWEEN_TO = 'tween_to',
  SCROLL_TO = 'scroll_to',
  TRANSFORM_DELTA = '~delta',
  TRANSFORM_VIRTUAL = '~virtual',
  TRANSFORM_OUTPUT = '~output'
}

export class Scroller extends EventEmitter {
  private attached = false;
  private locks: string[] = [];
  private availableBehaviors = new Map<string, ScrollBehaviorItem>();
  private attachedBehaviors = new Map<string, ScrollBehaviorItemDetach>();
  private unlisten: Unlisten;
  public dom: ScrollerDom;
  public position: ScrollerPosition = {
    output: { x: 0, y: 0 },
    virtual: { x: 0, y: 0 }
  };

  public constructor(
    domConfig: ScrollerDomConfig | ScrollerDom,
    behaviors: { [name: string]: ScrollBehaviorItem }
  ) {
    super();

    this.dom = domConfig instanceof ScrollerDom
      ? domConfig
      : new ScrollerDom(domConfig);

    for (const name in behaviors) {
      if (behaviors.hasOwnProperty(name)) {
        this.setBehavior(name, behaviors[name]);
      }
    }

    this.attach();
  }

  private attach() {
    if ( ! this.attached) {
      this.attached = true;
      this.unlisten = listenCompose(
        this.dom.on<Coordinate>(ScrollerDomEvent.RECALC, () => {
          this.updateDelta({ x: 0, y: 0 });
          Ticker.requestAnimationFrame(() => {
            this.emit(ScrollerEvent.RECALC);
          });
        }),
        this.on<Coordinate>(ScrollerEvent.DELTA, (delta) => {
          if ( ! this.isLocked()) {
            this.updateDelta(delta);
          }
        })
      );

      this.dom.attach();
      this.availableBehaviors.forEach((_behavior, key) => {
        this.attachBehavior(key);
      });
    }
  }

  public destroy() {
    if (this.attached) {
      this.attached = false;

      if (typeof this.unlisten === 'function') {
        this.unlisten();
        delete this.unlisten;
      }

      this.dom.detach();
      this.attachedBehaviors.forEach(detach => {
        if (typeof detach === 'function') {
          detach.call(this);
        }
      });
    }
  }

  public get behaviors() {
    return this.availableBehaviors;
  }

  public setBehavior(
    name: string,
    behavior: ScrollBehaviorItem
  ) {
    this.availableBehaviors.set(name, behavior);
  }

  public deleteBehavior(name: string) {
    if (this.attachedBehaviors.has(name)) {
      this.detachBehavior(name);
    }

    return this.availableBehaviors.delete(name);
  }

  public attachBehavior(name: string) {
    const behavior = this.availableBehaviors.get(name);

    if (behavior && ! this.attachedBehaviors.get(name)) {
      this.attachedBehaviors.set(name, behavior(this));

      return true;
    }

    return false;
  }

  public detachBehavior(name: string) {
    const detach = this.attachedBehaviors.get(name);

    if (detach) {
      detach.call(this);
      this.attachedBehaviors.delete(name);

      return true;
    }

    return false;
  }

  public updateDelta<T extends Partial<Coordinate>>(delta: T) {
    const virtPos = this.position.virtual;

    this.emit<T>(
      ScrollerEvent.TRANSFORM_DELTA,
      delta,
      (newDelta) => {
        delta.x = newDelta.x;
        delta.y = newDelta.y;
      }
    );

    this.updatePosition({
      x: isNum(delta.x) ? virtPos.x - (delta.x as number) : undefined,
      y: isNum(delta.y) ? virtPos.y - (delta.y as number) : undefined
    });
  }

  public updatePosition(virtPos?: Partial<Coordinate>) {
    if (virtPos && isNum(virtPos.x)) {
      this.position.virtual.x = virtPos.x as number;
    }

    if (virtPos && isNum(virtPos.y)) {
      this.position.virtual.y = virtPos.y as number;
    }

    this.emit<Coordinate>(
      ScrollerEvent.TRANSFORM_VIRTUAL,
      this.position.virtual,
      (newPos) => {
        this.position.virtual.x = newPos.x;
        this.position.virtual.y = newPos.y;
      }
    );

    if (
      this.isEventMuted(ScrollerEvent.TRANSFORM_OUTPUT) ||
      ! this.hasEventListeners(ScrollerEvent.TRANSFORM_OUTPUT)
    ) {
      this.updateOutput(this.position.virtual);
    } else {
      this.emit<OutputTransformEvent>(
        ScrollerEvent.TRANSFORM_OUTPUT,
        {
          pos: this.position.output,
          step: (outPos) => this.updateOutput(outPos)
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

  public scrollTo(
    pos: Partial<Coordinate>,
    skipOutputTransform = false
  ) {
    this.emit<ScrollToEvent>(
      ScrollerEvent.SCROLL_TO,
      { pos, skipOutputTransform }
    );
  }

  public tweenTo(
    pos: Partial<Coordinate>,
    options: TweenToEvent['options'] = {}
  ) {
    this.emit<TweenToEvent>(
      ScrollerEvent.TWEEN_TO,
      { pos, options }
    );
  }

  public onScroll(cb: EventListenerCb<Coordinate>) {
    return this.on(ScrollerEvent.OUTPUT, cb);
  }

  public onDelta(cb: EventListenerCb<Coordinate>) {
    return this.on(ScrollerEvent.DELTA, cb);
  }
}
