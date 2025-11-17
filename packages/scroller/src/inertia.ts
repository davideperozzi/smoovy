import { EventEmitter } from "@smoovy/emitter";
import { listen, listenCompose } from "@smoovy/listener";
import { Coordinate } from "@smoovy/utils";

export interface IntertiaConfig {
  eventTarget: Window | HTMLElement;
  pointerEvents?: boolean;
  touchDeltaMultiplier: number,
  touchVelocityMultiplier: number,
  pointerDeltaMultiplier: number,
  pointerVelocityMultiplier: number,
  inertiaDefault: boolean;
}

export enum InertiaEventType {
  DELTA = 'inertiadelta',
  VELOCITY = 'inertiavelocity',
  START = 'inertiastart',
  MOVE = 'inertiamove',
  END = 'inertiaend'
}

export interface InertiaEventMap {
  'inertiadelta': Coordinate;
  'inertiavelocity': Coordinate;
  'inertiastart': Coordinate;
  'inertiamove': Coordinate;
  'inertiaend': undefined;
}

const defaults: IntertiaConfig = {
  eventTarget: window,
  pointerEvents: false,
  touchDeltaMultiplier: 1,
  touchVelocityMultiplier: 20,
  pointerDeltaMultiplier: 1,
  pointerVelocityMultiplier: 25,
  inertiaDefault: false,
}

export class Inertia extends EventEmitter {
  private down = false;
  private locked = false;
  private moved = false;
  private config: IntertiaConfig;
  private velocity: Coordinate = { x: 0, y: 0 };
  private startPos: Coordinate = { x: 0, y: 0 };

  constructor(config: Partial<IntertiaConfig>) {
    super();

    this.config = { ...defaults, ...config };
  }

  private getPosition(event: TouchEvent | MouseEvent) {
    if (event instanceof MouseEvent) {
      return { pageX: event.pageX, pageY: event.pageY };
    }

    return (event.targetTouches ? event.targetTouches[0] : event) as Touch;
  }

  listen() {
    const { pointerEvents, eventTarget } = this.config;

    return listenCompose(
      listen(eventTarget, 'touchstart', (event) => this.handleStart(event), { passive: false }),
      listen(eventTarget, 'touchmove', (event) => this.handleMove(event), { passive: false }),
      listen(eventTarget, 'touchend', () => this.handleEnd(), { passive: false }),
      pointerEvents ? listenCompose(
        listen(eventTarget, 'mousedown', (event) => this.handleStart(event, true)),
        listen(eventTarget, 'mousemove', (event) => this.handleMove(event, true)),
        listen(eventTarget, 'mouseleave', () => this.handleEnd()),
        listen(eventTarget, ['mouseup', 'mousecancel'], () => this.handleEnd()),
      ) : undefined
    )
  }

  lock(locked = true) {
    this.locked = locked;
  }

  handleStart(event: TouchEvent | MouseEvent, mouse = false) {
    if (mouse && event instanceof MouseEvent && event.button !== 0 || this.locked) {
      return;
    }

    const pos = this.getPosition(event);

    this.startPos.x = pos.pageX;
    this.startPos.y = pos.pageY;
    this.down = true;

    this.emit(InertiaEventType.START, this.startPos);
  }

  handleEnd() {
    const inertia = Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0;

    if (this.down && inertia) {
      this.emit(InertiaEventType.DELTA, this.velocity);

      requestAnimationFrame(() => {
        this.velocity.x = 0;
        this.velocity.y = 0;
      });
    }

    if (this.moved) {
      this.emit(InertiaEventType.END);
    }

    this.down = false;
    this.moved = false;
  }

  handleMove(event: TouchEvent | MouseEvent, mouse = false) {
    if (this.down && !this.locked) {
      const {
        touchDeltaMultiplier,
        touchVelocityMultiplier,
        pointerDeltaMultiplier,
        pointerVelocityMultiplier,
        inertiaDefault
      } = this.config;

      if (inertiaDefault !== true) {
        event.preventDefault();
      }

      const pos = this.getPosition(event);
      const delta = { x: 0, y: 0 };

      const deltaMultiplier = mouse ? pointerDeltaMultiplier : touchDeltaMultiplier;
      const velocityMultiplier = mouse ? pointerVelocityMultiplier : touchVelocityMultiplier;
      const diffX = this.startPos.x - pos.pageX;
      const diffY = this.startPos.y - pos.pageY;

      delta.x = diffX * deltaMultiplier;
      delta.y = diffY * deltaMultiplier;

      this.velocity.x = delta.x * velocityMultiplier;
      this.velocity.y = delta.y * velocityMultiplier;
      this.startPos.x = pos.pageX;
      this.startPos.y = pos.pageY;
      this.moved = true;

      this.emit(InertiaEventType.MOVE, { x: pos.pageX, y: pos.pageY });
      this.emit(InertiaEventType.VELOCITY, this.velocity);
      this.emit(InertiaEventType.DELTA, delta);
    }
  }
}