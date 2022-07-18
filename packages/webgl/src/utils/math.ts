export type Mat4 = Float32Array;
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Returns an identity matrix */
export function mat4(): Mat4 {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

/** Transforms to an identity matrix */
export function mat4i(m: Mat4): Mat4 {
  m[0] = m[5] = m[10] = m[15] = 1;
  m[1] = m[2] = m[3] = 0;
  m[4] = m[6] = m[7] = 0;
  m[8] = m[9] = m[11] = 0;
  m[12] = m[13] = m[14] = 0;

  return m;
}

export function mat4log(m: Mat4) {
  console.table([
    [ m[0], m[1], m[2], m[3] ].map(val => Number(val.toFixed(3))),
    [ m[4], m[5], m[6], m[7] ].map(val => Number(val.toFixed(3))),
    [ m[8], m[9], m[10], m[11] ].map(val => Number(val.toFixed(3))),
    [ m[12], m[13], m[14], m[15] ].map(val => Number(val.toFixed(3)))
  ]);
}

/** Returns current translation values */
export function mat4gt(m: Mat4) {
  return [ m[12], m[13], m[14] ];
}

/** Translates matrix by a vector (object) */
export function mat4tv(m: Mat4, v: Partial<Vec3>): Mat4 {
  return mat4t(m, [ v.x, v.y, v.z ]);
}

/** Translates matrix by a vector (absolute) */
export function mat4ta(m: Mat4, t: [ number?, number?, number? ]): Mat4 {
  if (typeof t[0] !== 'undefined') {
    m[12] = t[0];
  }

  if (typeof t[1] !== 'undefined') {
    m[13] = t[1];
  }

  if (typeof t[2] !== 'undefined') {
    m[15] = t[2];
  }

  return m;
}

/** Translates the matrix by a vector (relative) */
export function mat4t(m: Mat4, t: [ number?, number?, number? ]): Mat4 {
  const x = t[0] || 0;
  const y = t[1] || 0;
  const z = t[2] || 0;

  m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
  m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
  m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
  m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];

  return m;
}

/** Get scaling */
export function mat4gs(m: Mat4) {
  return [
    Math.hypot(m[0], m[1], m[2]),
    Math.hypot(m[4], m[5], m[6]),
    Math.hypot(m[8], m[9], m[10]),
  ];
}

/** Scales the matrix by a vector */
export function mat4s(m: Mat4, s: [ number, number, number ]): Mat4 {
  const x = s[0];
  const y = s[1];
  const z = s[2];

  m[0] *= x;
  m[1] *= x;
  m[2] *= x;
  m[3] *= x;
  m[4] *= y;
  m[5] *= y;
  m[6] *= y;
  m[7] *= y;
  m[8] *= z;
  m[9] *= z;
  m[10] *= z;
  m[11] *= z;

  return m;
}

/** Rotates the matrix by a vector */
export function mat4r(m: Mat4, r: [ number, number, number ]): Mat4 {
  // @todo: do quick mafs
  return m;
}

/**
 * Creates a perspective projection matrix.
 *
 * https://github.com/toji/gl-matrix/blob/master/src/mat4.js#L1537-L1563
 *
 * @param fovY vertical field of view in radians
 * @param asp aspect ratio
 * @param near near plane bound
 * @param far far plane bound
 */
export function mat4p(
  mat: Mat4,
  fovY: number,
  asp: number,
  near: number,
  far?: number
) {
  const fov = 1.0 / Math.tan(fovY / 2);

  mat[0] = fov / asp;
  mat[5] = fov;
  mat[11] = -1;

  mat[1] = mat[2] = mat[3] = mat[4] = mat[6] = 0;
  mat[7] = mat[8] = mat[9] = mat[15] = 0;

  if (far !== undefined && far !== Infinity) {
    const nf = 1 / (near - far);

    mat[10] = (far + near) * nf;
    mat[14] = (2 * far * near) * nf;
  } else {
    mat[10] = -1;
    mat[14] = -2 * near;
  }

  return mat;
}
