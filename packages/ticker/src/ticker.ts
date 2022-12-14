export type TickerUpdateCallback = (
  delta: number,
  time: number,
  kill: () => void
) => void;

export class TickerThread {
  public dead = false;

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
  public override = false;
  private threads: TickerThread[] = [];
  private lastTime = 0;
  private _ticking = false;

  public static now() {
    return window.performance.now();
  }

  public get ticking() {
    return this._ticking;
  }

  private tick(delta: number, time: number) {
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
    this.tick(
      time - this.lastTime,
      this.lastTime = time
    );
  }

  public animate() {
    window.requestAnimationFrame((time) => {
      this.update(time);

      if (this._ticking && ! this.override && this.threads.length > 0) {
        this.animate();
      } else {
        this._ticking = false;
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

    if ( ! this._ticking && ! this.override) {
      this.lastTime = Ticker.now();
      this._ticking = true;

      this.animate();
    }

    return thread;
  }
}