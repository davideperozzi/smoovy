import { Coordinate, isObj } from '@smoovy/utils';

import { Color, Size, UniformType, UniformValue } from './uniform';

export function createCanvas(canvas?: HTMLCanvasElement | string) {
  if (canvas instanceof HTMLCanvasElement) {
    return canvas;
  }

  if (typeof canvas === 'string') {
    return document.querySelector(canvas) as HTMLCanvasElement;
  }

  const newCanvas = document.createElement('canvas');

  document.body.prepend(newCanvas);

  return newCanvas;
}

export function createShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string
) {
  const shader = gl.createShader(type);

  if ( ! shader) {
    throw new Error('failed to create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if ( ! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(`shader compile failed: ${info}`);
  }

  return shader;
}

export function uniformValue(value: UniformValue) {
  if (
    isObj(value) &&
    !(value instanceof Float32Array || value instanceof Int32Array)
  ) {
    if ('x' in value && 'y' in value) {
      const oldValue = value as Coordinate & { z?: number, w?: number };
      const newValue = [ oldValue.x, oldValue.y ];

      if (typeof oldValue.z === 'number') {
        newValue.push(oldValue.z);
      }

      if (typeof oldValue.w === 'number') {
        newValue.push(oldValue.w);
      }

      return newValue;
    } else if ('width' in value && 'height' in value) {
      const oldValue = value as Size;

      return [ oldValue.width, oldValue.height ];
    } else if ('r' in value && 'g' in value && 'b' in value) {
      const oldValue = value as Partial<Color>;
      const newValue = [ oldValue.r || 0, oldValue.g || 0, oldValue.b || 0 ];

      if ('a' in oldValue) {
        newValue.push(oldValue.a || 1);
      }

      return newValue;
    } else {
      return Object.values(value);
    }
  }

  return value as number | number[] | Float32Array;
}

export function uniformMethod(
  value: number | number[] | Float32Array,
  type?: UniformType
  ) {
  if (typeof value === 'number') {
    return `1${type === 'i' ? 'i' : 'f'}`;
  } else if (Array.isArray(value) || value instanceof Float32Array) {
    const length = value.length;

    if (length <= 4 && length >= 2) {
      if (type === 'm2') {
        return 'Matrix2fv';
      }

      return `${length}fv`;
    } if (length === 9) {
      return 'Matrix3fv';
    } else if (length === 16) {
      return 'Matrix4fv';
    }
  }
}

const triangulateCache: Record<string, Float32Array> = {};

export function triangulate(density: Coordinate, center = true, cache = true) {
  const cacheKey = `${center ? 'c' : ''}${density.x}${density.y}`;

  if (cache && triangulateCache[cacheKey]) {
    return new Float32Array(triangulateCache[cacheKey]);
  }

  const w = 1;
  const h = 1;
  const pX = center ? -w * .5 : 0;
  const pY = center ? -h * .5 : 0;
  const sX = w / density.x;
  const sY = h / density.y;
  const vertices = new Float32Array(18 * density.x * density.y);
  let index = 0;

  for (let iY = 0; iY < density.y; iY++) {
    const y = pY + sY * iY;

    for (let iX = 0; iX < density.x; iX++) {
      const x = pX + sX * iX;

      vertices.set([
        // top-left poly
        x,       y + sY, 0, // top-left corner     = 0, 1, 0
        x,       y,      0, // bottom-left corner  = 0, 0, 0
        x + sX,  y + sY, 0, // top-right corner    = 1, 1, 0
        // bottom-right poly
        x + sX,  y,      0, // bottom-right corner = 1, 0, 0
        x + sX,  y + sY, 0, // top-right corner    = 1, 1, 0
        x,       y,      0, // bottom-left corner  = 0, 0, 0
      ], index);

      index += 18;
    }
  }

  if (cache) {
    triangulateCache[cacheKey] = vertices;
  }

  return new Float32Array(vertices);
}

const warnings: Record<string, boolean> = {};

export function warnOnce(message: string, warn = true) {
  if ( ! warnings[message] && warn) {
    warnings[message] = true;
    console.warn(message);
  }
}