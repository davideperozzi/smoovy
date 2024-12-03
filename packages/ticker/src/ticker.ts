export type TickerKill = () => void;

export type TickerUpdate = (
  delta: number,
  time: number,
  kill: TickerKill
) => void;

export interface TickerTask {
  update: TickerUpdate;
  start: number;
  order: number;
  dead: boolean;
  kill: TickerKill;
}

export class Ticker {
  static main = new Ticker();
  ticking = false;
  private tasks: TickerTask[] = [];
  private time = 0;

  constructor(
    public override = false
  ) {
    if ( ! this.override) {
      this.loop();
    }
  }

  static now() {
    return this.main.time;
  }

  tick(passed: number) {
    let deadTask: TickerTask | undefined;

    for (const task of this.tasks) {
      if (task.dead) {
        deadTask = task;

        continue;
      }

      task.update(passed - this.time, this.time - task.start, task.kill);
    }

    if (deadTask) {
      this.tasks.splice(this.tasks.indexOf(deadTask), 1);
    }

    this.time = passed;
  }

  loop() {
    this.ticking = true;

    window.requestAnimationFrame((time) => {
      this.tick(time);

      if ( ! this.override) {
        this.loop();
      } else {
        this.ticking = false;
      }
    });
  }

  add(update: TickerUpdate, order = 0): TickerTask {
    const task = {
      update,
      order,
      start: this.time,
      dead: false,
      kill: () => {
        task.dead = true
      }
    };

    this.tasks.push(task);
    this.tasks.sort((a, b) => a.order - b.order);

    return task;
  }
}