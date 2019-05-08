type TickerUpdateCallback = (
  delta: number,
  time: number,
  kill: () => void
) => void;

export class TickerThread {
  public dead: boolean = false;

  public constructor(
    private calllback: TickerUpdateCallback
  ) {}

  public update(delta: number, time: number) {
    this.calllback(delta, time, this.kill.bind(this));
  }

  public kill() {
    this.dead = true;
  }
}

export class Ticker {
  public readonly intervalMs: number = 60 / 1000;
  public ticking: boolean = false;
  public override: boolean = false;
  private threads: TickerThread[] = [];
  private lastTime: number = -1;
  private minDeltaMs: number = 0;
  private maxDeltaMs: number = 1000 / 10;

  public static requestAnimationFrame(callback: FrameRequestCallback) {
    return window.requestAnimationFrame
      ? window.requestAnimationFrame(callback)
      : window.setTimeout(callback, 1000 / 60);
  }

  public static now(): number {
    return (window.performance || Date).now();
  }

  public setMinFPS(fps: number) {
    const minFPS = Math.max(Math.min(fps, this.maxFPS), 0);

    return this.maxDeltaMs = 1 / Math.min(minFPS / 1000, this.intervalMs);
  }

  public get minFPS() {
    return 1000 / this.maxDeltaMs;
  }

  public setMaxFPS(fps: number) {
    if (fps / 1000 > this.intervalMs) {
      return this.minDeltaMs = 0;
    }

    const maxFPS = Math.max(Math.max(fps, this.minFPS), 1);

    return this.minDeltaMs = 1 / Math.min(maxFPS / 1000, this.intervalMs);
  }

  public get maxFPS() {
    return this.minDeltaMs > 0
      ? 1000 / this.minDeltaMs
      : this.intervalMs * 1000;
  }

  public tick(delta: number, time: number = Ticker.now()) {
    const deadThreads: Array<TickerThread> = [];

    for (let i = 0, len = this.threads.length; i < len; i++) {
      const thread = this.threads[i];

      if (thread.dead) {
        deadThreads.push(thread);
      } else {
        thread.update(delta, time);
      }
    }

    for (let i = 0, len = deadThreads.length; i < len; i++) {
      this.buryThread(deadThreads[i]);
    }
  }

  public update(time = Ticker.now()) {
    if (time > this.lastTime) {
      let deltaMs = time - this.lastTime;

      if (deltaMs > this.maxDeltaMs) {
        deltaMs = this.maxDeltaMs;
      }

      if (this.minDeltaMs && deltaMs + 1 < this.minDeltaMs) {
        return;
      }

      this.tick(deltaMs * this.intervalMs, time);
    }

    this.lastTime = time;
  }

  public animate() {
    Ticker.requestAnimationFrame((time) => {
      this.update(time);

      if (this.ticking && ! this.override && this.threads.length > 0) {
        this.animate();
      } else {
        this.ticking = false;
      }
    });
  }

  public kill() {
    this.threads.forEach((thread) => thread.kill());
  }

  private buryThread(thread: TickerThread) {
    this.threads.splice(this.threads.indexOf(thread), 1);
  }

  public add(callback: TickerUpdateCallback): TickerThread {
    const thread = new TickerThread(callback);

    this.threads.push(thread);

    if ( ! this.ticking && ! this.override) {
      this.lastTime = Ticker.now();
      this.ticking = true;

      this.animate();
    }

    return thread;
  }
}
