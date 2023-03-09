export function mapRange(
  value: number,
  inStart: number,
  inEnd: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + (outMax - outMin) / (inEnd - inStart) * (value - inStart);
}

export function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(
  s: number,
  e: number,
  m: number
) {
  return s * (1 - m) + e * m;
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

export function cutDec(value: number, precision: number) {
  const str = value.toString();

  return parseFloat(str.substring(0, str.indexOf('.') + 1 + precision));
}

export function mod(x: number, n: number) {
  return (x % n + n) % n;
}