import { EventEmitter, EventListener } from "@smoovy/emitter";
import { listen, listenCompose, Unlisten } from "@smoovy/listener";
import { Ticker, TickerTask } from "@smoovy/ticker";
import { clamp, Coordinate, cutDec, damp, Size } from "@smoovy/utils";
import { Inertia, InertiaEventType } from "./inertia";

export interface ScrollerConfig {
  /**
   * The damping value used to align
   * the current position with the new
   * position
   *
   * @default 0.1
   */
  damping: number;

  /**
   * Whether to start the ticker immediately
   *
   * @default true
   */
  autoStart: boolean;

  /**
   * The threshold being used in order to determine
   * when the scroll animation has settled.
   *
   * @default 0.005
   */
  threshold: number;

  /**
   * The refresh rate that's being simulated in order
   * to achieve frame-independent damping
   *
   * @default 60
   */
  frequency: number;

  /**
   * Whether to allow keyboard events to simulate the
   * native behavior of the browser
   *
   * @default true
   */
  keyboardEvents: boolean;

  /**
   * The default line height of the browser used for
   * legace delta calculations and the keyboard events.
   * For most browsers this is 16.
   *
   * @default 16
   */
  lineHeight: number;

  /**
   * A multiplier for the wheel delta value. This makes
   * the scrolling go faster. Changing this will make
   * the scrolling feel less natural usually and can
   * have unexpected results for different scrolling devices
   *
   * @default 1
   */
  wheelMultiplier: number;

  /**
   * Whether to allow the poibter to drag the content
   * and simulate touch events with the mouse. This
   * will also add a slight inertia effect, so you
   * can "throw" the content like on the phone.
   *
   * @default false
   */
  pointerEvents: boolean;

  /**
   * The multiplier for the pointer drag effect.
   * This value will be multiplied with the delta value.
   * So if you change this the pivot point will change
   * during the drag.
   *
   * @default 1
   */
  pointerMultiplier: number;

  /**
   * The multiplier for the pointer drag effect.
   * This value will be multiplied with the velocity,
   * before the user releases the button.
   *
   * @default 25
   */
  pointerVelocity: number;

  /**
   * The multiplier for the touch drag effect.
   * This value will be multiplied with the delta value.
   * So if you change this the pivot point will change
   * during the drag.
   *
   * @default 1
   */
  touchMultiplier: number;

  /**
   * The multiplier for the touch drag effect.
   * This value will be multiplied with the velocity,
   * before the user removes his finger.
   *
   * @default 20
   */
  touchVelocity: number;

  /**
   * Whether to enable touch events and simulate the
   * mobile touch experience
   *
   * @default true
   */
  touchEvents: boolean;

  /**
   * The target element or window used to track events
   * for the inertia and touch simulation
   *
   * @default Window
   */
  inertiaTarget?: Window | HTMLElement;

  /**
   * The target element or window used to track events
   * for the mouse wheel events
   *
   * @default Window
   */
  wheelTarget?: Window | HTMLElement;

  /**
   * Whether to lock one axis compleley forcing
   * the position to always be 0
   *
   * @default false
   */
  lockAxis?: 'x' | 'y' | false;

  /**
   * How many decimals to keep for the output position.
   * Since we're using a lerp and never really getexactly
   * to the virtual position, this ensures the decimal space
   * isn't growing too much. It determines, how many decimals
   * to keep
   *
   * @default 4
   */
  precision?: number;
}

interface Locks {
  position: { all: Set<string> };
  controls: {
    all: Set<string>;
    wheel: Set<string>;
  };
  keyboard: { all: Set<string>;
    Space: Set<string>;
    ArrowLeft: Set<string>;
    ArrowRight: Set<string>;
    ArrowDown: Set<string>;
    ArrowUp: Set<string>;
    PageDown: Set<string>;
    PageUp: Set<string>;
    Homey: Set<string>;
    End: Set<string>
  };
}

interface LocksMap {
  position: boolean;
  controls: boolean | Partial<{ [K in keyof Locks['controls']]: boolean; }>;
  keyboard: boolean | Partial<{ [K in keyof Locks['keyboard']]: boolean; }>;
}

export enum ScrollerEventType {
  SCROLL = 'scroll',
  RESIZE = 'resize',
  VIRTUAL = 'virtual',
  LOCK = 'lock'
}

export interface ScrollerScrollEvent extends Coordinate {}
export interface ScrollerVirtualEvent extends Coordinate {}
export interface ScrollerResizeEvent {}
export interface ScrollerLockEvent {
  locked: boolean;
}

export interface ScrollerEventMap {
  'scroll': ScrollerScrollEvent;
  'virtual': ScrollerVirtualEvent;
  'resize': ScrollerResizeEvent;
  'lock': ScrollerLockEvent;
}

const keyspaces: Record<string, Partial<Coordinate>> = {
  'Space': { y: 55.875 },
  'ArrowLeft': { x: -2.5 },
  'ArrowRight': { x: 2.5 },
  'ArrowDown': { y: 2.5 },
  'ArrowUp': { y: -2.5 },
  'PageDown': { y: 55.875 },
  'PageUp': { y: -55.875 },
  'Home': { y: -Infinity },
  'End': { y: Infinity }
};

export const defaults: ScrollerConfig = {
  autoStart: true,
  frequency: 60,
  wheelMultiplier: 1,
  pointerEvents: false,
  pointerMultiplier: 1,
  pointerVelocity: 25,
  touchMultiplier: 1,
  touchVelocity: 20,
  keyboardEvents: true,
  touchEvents: true,
  threshold: 0.005,
  lockAxis: false,
  lineHeight: 16,
  damping: 0.1,
  precision: 4
};

export class Scroller<C extends ScrollerConfig = ScrollerConfig> extends EventEmitter<ScrollerEventMap> {
  readonly limit = { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
  readonly virtual: Coordinate = { x: 0, y: 0 };
  readonly output: Coordinate = { x: 0, y: 0 };
  readonly config: C;
  protected animating = false;
  protected unlistenInertia?: Unlisten;
  private unlisten?: Unlisten;
  private ticker?: TickerTask;
  private inertia!: Inertia;
  private locks: Locks = {
    position: { all: new Set<string>() },
    controls: {
      all: new Set<string>(),
      wheel: new Set<string>()
    },
    keyboard: {
      all: new Set<string>(),
      Space: new Set<string>(),
      ArrowLeft: new Set<string>(),
      ArrowRight: new Set<string>(),
      ArrowDown: new Set<string>(),
      ArrowUp: new Set<string>(),
      PageDown: new Set<string>(),
      PageUp: new Set<string>(),
      Homey: new Set<string>(),
      End: new Set<string>()
    }
  };

  constructor(config: Partial<C> = {}, init = true) {
    super();

    this.config = { ...defaults, ...config } as C;

    if (init) {
      this.init();
    }
  }

  init() {
    this.update();

    if (this.config.autoStart) {
      this.start();
    }
  }

  start() {
    this.stop();

    this.ticker = Ticker.main.add(delta => this.tick(delta));
  }

  onScroll(cb: EventListener<ScrollerEventMap[ScrollerEventType.SCROLL]>) {
    return this.on(ScrollerEventType.SCROLL, cb);
  }

  onVirtual(cb: EventListener<ScrollerEventMap[ScrollerEventType.VIRTUAL]>) {
    return this.on(ScrollerEventType.VIRTUAL, cb);
  }

  onLock(cb: EventListener<ScrollerEventMap[ScrollerEventType.LOCK]>) {
    return this.on(ScrollerEventType.LOCK, cb);
  }

  stop() {
    if (this.ticker) {
      this.ticker.kill();
      delete this.ticker;
    }
  }

  update() {
    if (this.unlisten) {
      this.unlisten();
    }

    this.inertia = new Inertia({
      pointerEvents: this.config.pointerEvents,
      pointerDeltaMultiplier: this.config.pointerMultiplier,
      pointerVelocityMultiplier: this.config.pointerVelocity,
      touchDeltaMultiplier: this.config.touchMultiplier,
      touchVelocityMultiplier: this.config.touchVelocity,
      ...(this.config.inertiaTarget
        ? { eventTarget: this.config.inertiaTarget }
        : {})
    });

    this.unlisten = this.listen();

    return this;
  }

  protected get wheelTarget() {
    return this.config.wheelTarget || window;
  }

  protected get viewWidth() {
    return this.config.lineHeight * 24;
  }

  protected get viewHeight() {
    return this.config.lineHeight * 24;
  }

  protected attachInertia() {
    this.unlistenInertia = listenCompose(
      this.inertia.listen(),
      this.inertia.on(InertiaEventType.DELTA, (delta: Coordinate) => this.handleInertia(delta)),
    );
  }

  protected detachInertia() {
    if (this.unlistenInertia) {
      this.unlistenInertia();
      delete this.unlistenInertia;
    }
  }

  protected listen() {
    this.attachInertia();

    return listenCompose(
      listen(this.wheelTarget, 'wheel', event => this.handleWheel(event), { passive: false }),
      listen(window, 'keydown', event => this.handleKeyboard(event)),
    );
  }

  get xAxisLocked() {
    return this.config.lockAxis === 'x';
  }

  get yAxisLocked() {
    return this.config.lockAxis === 'y';
  }

  tick(delta = 1) {
    const lockX = this.xAxisLocked;
    const lockY = this.yAxisLocked;
    const threshold = this.config.threshold;
    const precision = this.config.precision;
    const diffX = lockX ? 0 : Math.abs(this.virtual.x - this.output.x);
    const diffY = lockY ? 0 : Math.abs(this.virtual.y - this.output.y);

    this.animating = diffX > threshold || diffY > threshold;

    if (this.animating) {
      const damping = this.config.damping * this.config.frequency;

      if (!lockX) {
        this.output.x = cutDec(
          damp(this.output.x, this.virtual.x, damping, delta * 0.001),
          precision
        );
      }

      if (!lockY) {
        this.output.y = cutDec(
          damp(this.output.y, this.virtual.y, damping, delta * 0.001),
          precision
        );
      }

      this.handleScroll(this.output);
    }
  }

  protected handleInertia(delta: Coordinate) {
    this.addVirtual(delta.x, delta.y);
  }

  protected handleScroll(pos = this.output) {
    this.emit(ScrollerEventType.SCROLL, pos);
  }

  protected handleKeyboard(event: KeyboardEvent) {
    const { code } = event;
    const locks = this.locks;
    const subLock = event.code as keyof typeof locks.keyboard;

    if (locks.controls.all.size > 0 || locks.keyboard.all.size > 0) {
      return;
    }

    if (locks.keyboard[subLock] && locks.keyboard[subLock].size > 0) {
      event.preventDefault();

      return;
    }

    const activeEl = document.activeElement as HTMLElement|undefined;
    const editing = activeEl && (
      activeEl.tagName == 'INPUT' ||
      activeEl.tagName == 'TEXTAREA' ||
      activeEl.isContentEditable
    );

    if (editing && (
      code == 'ArrowUp' ||
      code == 'ArrowDown' ||
      code == 'ArrowLeft' ||
      code == 'ArrowRight' ||
      code == 'Space'
    )) {
      return;
    }

    const mult = keyspaces[code];

    if ( ! mult) {
      return;
    }

    const { lineHeight } = this.config;
    const x = this.virtual.x + (mult.x ? lineHeight*mult.x : 0);
    const y = this.virtual.y + (mult.y ? lineHeight*mult.y : 0);

    this.setVirtual(x, y);
  }

  protected handleWheel(event: WheelEvent) {
    if (event.ctrlKey || this.locks.controls.wheel.size > 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.locks.controls.all.size > 0) {
      return;
    }

    let { deltaX, deltaY, deltaMode } = event;
    const { wheelMultiplier, lineHeight } = this.config;

    if (deltaMode === 1) {
      deltaX *= lineHeight;
      deltaY *= lineHeight;
    } else if (deltaMode === 2) {
      deltaX *= this.viewWidth;
      deltaY *= this.viewHeight;
    }

    deltaX *= wheelMultiplier;
    deltaY *= wheelMultiplier;

    this.addVirtual(deltaX, deltaY);
  }

  protected addVirtual(x = 0, y = 0) {
    this.setVirtual(this.virtual.x + x, this.virtual.y + y);
  }

  protected setVirtual(x?: number, y?: number) {
    if (this.locks.position.all.size > 0) {
      return;
    }

    if (typeof x !== 'undefined' && !this.xAxisLocked) {
      this.virtual.x = x;
    }

    if (typeof y !== 'undefined' && !this.yAxisLocked) {
      this.virtual.y = y;
    }

    this.virtual.x = clamp(this.virtual.x, this.limit.minX, this.limit.maxX);
    this.virtual.y = clamp(this.virtual.y, this.limit.minY, this.limit.maxY);

    this.emit(ScrollerEventType.VIRTUAL, this.virtual);
  }

  scrollTo(pos: Partial<Coordinate>, jump = false) {
    this.setVirtual(pos.x, pos.y);

    if (jump) {
      this.output.x = this.virtual.x;
      this.output.y = this.virtual.y;

      this.handleScroll();
    }
  }

  isLocked(
    name?: keyof LocksMap,
    key: keyof Locks[NonNullable<typeof name>] = 'all'
  ) {
    if (name) {
      if (this.locks[name]) {
        return this.locks[name][key].size > 0;
      }

      return false;
    }

    return Object.values(this.locks)
      .reduce((size, lock) => size + lock[key].size, 0) > 0;
  }

  lock(locked: boolean | Partial<LocksMap> = true, name = '_') {
    for (const lockName in this.locks) {
      const key = lockName as keyof typeof this.locks;
      const lock = this.locks[key];

      if (typeof locked === 'boolean') {
        if (locked) {
          lock.all.add(name)
        } else {
          lock.all.delete(name);
        }
      } else if (typeof locked == 'object' && typeof locked[key] == 'boolean') {
        if (locked[key]) {
          lock.all.add(name)
        } else {
          lock.all.delete(name);
        }
      } else if (typeof locked == 'object' && typeof locked[key] == 'object') {
        const subLocks = locked[key] as Record<string, boolean>;

        for (const subName in subLocks) {
          const subKey = subName as keyof typeof lock;

          if (subLocks[subName]) {
            lock[subKey].add(name);
          } else {
            lock[subKey].delete(name);
          }
        }
      }
    }

    this.emit(ScrollerEventType.LOCK, { locked: this.isLocked() });
  }

  destroy() {
    this.detachInertia();

    if (this.unlisten) {
      this.unlisten();
      delete this.unlisten;
    }

    if (this.ticker) {
      this.ticker.kill();
    }
  }
}