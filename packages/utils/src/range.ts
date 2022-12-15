import { mapRange } from './math';

export class Range {
  public start: number;
  public end: number;

  public constructor(
    start: number,
    end: number,
  ) {
    this.start = start > end ? end : start;
    this.end = end > start ? end : start;
  }

  public mapTo(
    val: number,
    min = 0,
    max = 1,
  ) {
    return mapRange(val, this.start, this.end, min, max);
  }
}
