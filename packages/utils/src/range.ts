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
    min: number = 0,
    max: number = 1,
  ) {
    return mapRange(val, this.start, this.end, min, max);
  }
}
