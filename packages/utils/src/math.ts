export function mapRange(
  value: number,
  inStart: number,
  inEnd: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + (outMax - outMin) / (inEnd - inStart) * (value - inStart);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, m: number) {
  return a * (1 - m) + b * m;
}

// stolen from https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
export function damp(a: number, b: number, lambda: number, dt: number) {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

export function between(num: number, a: number, b: number, inc = false) {
  return inc
    ? num >= Math.min(a, b) && num <= Math.max(a, b)
    : num > Math.min(a, b) && num < Math.max(a, b);
}

export function roundDec(value: number, precision: number) {
  return Number(
    Math.round(value + ('e' as any) + precision) + 'e-' + precision
  );
}

export function cutDec(value: number, precision = 0) {
  return parseFloat(value.toFixed(precision));
}

export function mod(x: number, n: number) {
  return (x % n + n) % n;
}