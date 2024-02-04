import { Vec2, Vec4 } from './math';

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type UniformType = 'i' | 'f' | 'v2' | 'v3' | 'v4' | 'm2' | 'm3' | 'm4';
export type UniformValue =
  number | number[] | Float32Array |
  Vec2 | Vec2 | Vec4 | Color;