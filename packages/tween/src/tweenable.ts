export type TweenTarget = { [key: string]: number } | any;

export interface Tweenable {
  target: TweenTarget;
  stop(): void;
}
