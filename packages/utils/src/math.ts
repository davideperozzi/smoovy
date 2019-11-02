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

export function between(num: number, a: number, b: number) {
  return num > Math.min(a, b) && num < Math.max(a, b);
}

export function round(
  value: number,
  precision: number,
  type = 'round'
) {
  return Number(
    (Math as any)[type](value + ('e' as any) + precision) + 'e-' + precision
  );
}


export function cutdec(
  value: number,
  precision: number
) {
  return parseFloat(value.toFixed(precision));
}
