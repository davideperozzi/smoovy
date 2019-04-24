import { Tweenable, TweenTarget } from './tweenable';

export class TweenRegistry {
  private entries: Tweenable[] = [];

  public add(
    tween: Tweenable,
    overwrite: boolean = true
  ): number {
    if (overwrite) {
      const contains = this.contains(tween.target);

      if (contains > -1) {
        this.remove(tween);
      }
    }

    return this.entries.push(tween);
  }

  public contains(target: TweenTarget): number {
    return this.entries.findIndex(entry => entry.target === target);
  }

  public remove(target: TweenTarget) {
    this.entries = this.entries.filter(entry => {
      const remove = entry.target === target;

      if (remove) {
        entry.stop();
      }

      return ! remove;
    });
  }
}
