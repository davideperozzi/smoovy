import { EventEmitter, EventListenerCb } from '@smoovy/event';
import { Coordinate } from '@smoovy/utils';

import { ScrollerDom, ScrollerDomConfig } from './dom';

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
  OUTPUT = 'output',
  INPUT = 'input',
  TRANSFORM_DELTA = '~t.delta',
  TRANSFORM_VIRTUAL = '~t.virtual',
  TRANSFORM_OUTPUT = '~t.output'
}

export class Scroller extends EventEmitter {
  public dom: ScrollerDom;
  private attached = false;
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

    this.on<Coordinate>('delta', (delta) => this.updateDelta(delta));
    this.dom.on('recalc', () => this.updateDelta({ x: 0, y: 0 }));

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

    this.emit<OutputTransformEvent>(
      ScrollerEvent.TRANSFORM_OUTPUT,
      {
        pos: this.position.output,
        step: this.updateOutput.bind(this)
      }
    );
  }

  protected updateOutput(pos: Coordinate) {
    this.position.output.x = pos.x;
    this.position.output.y = pos.y;

    this.emit(ScrollerEvent.OUTPUT, pos);
  }

  public onScroll(cb: EventListenerCb<Coordinate>) {
    return this.on('output', cb);
  }

  public onDelta(cb: EventListenerCb<Coordinate>) {
    return this.on('delta', cb);
  }
}
