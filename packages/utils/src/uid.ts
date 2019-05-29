export class Uid {
  private static next = 0;

  public static reset() {
    this.next = 0;
  }

  public static get(prefix: string = '') {
    return prefix + (this.next++).toString(36);
  }
}
