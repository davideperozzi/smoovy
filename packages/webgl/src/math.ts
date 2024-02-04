export type Mat4 = Float32Array;
export type Vec3A = [ number, number, number ];
export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 extends Vec2 {
  z: number;
}

export interface Vec4 extends Vec3 {
  w: number;
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
export function mat4i(m: Mat4, out = m): Mat4 {
  out[0] = m[5] = m[10] = m[15] = 1;
  out[1] = m[2] = m[3] = 0;
  out[4] = m[6] = m[7] = 0;
  out[8] = m[9] = m[11] = 0;
  out[12] = m[13] = m[14] = 0;

  return out;
}

/** Prints the matrix in a readable format to the console */
export function mat4log(m: Mat4) {
  console.table([
    [ m[0], m[1], m[2], m[3] ].map(val => Number(val.toFixed(3))),
    [ m[4], m[5], m[6], m[7] ].map(val => Number(val.toFixed(3))),
    [ m[8], m[9], m[10], m[11] ].map(val => Number(val.toFixed(3))),
    [ m[12], m[13], m[14], m[15] ].map(val => Number(val.toFixed(3)))
  ]);
}

/** Translates matrix by a vector (object) */
export function mat4tv(m: Mat4, v: Partial<Vec3>, out = m): Mat4 {
  return mat4t(m, [ v.x, v.y, v.z ], out);
}

/** Translates the matrix by a vector (relative) */
export function mat4t(m: Mat4, t: Partial<Vec3A>, out = m): Mat4 {
  const x = t[0] || 0;
  const y = t[1] || 0;
  const z = t[2] || 0;

  out[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
  out[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
  out[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
  out[15] = m[3] * x + m[7] * y + m[11] * z + m[15];

  return out;
}

/** multiply two matrices and output the transformed one */
export function mat4m(m1: Mat4, m2: Mat4, out = m1): Mat4 {
  out[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[12] * m2[8] + m1[3] * m2[12];
  out[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
  out[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
  out[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];
  out[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
  out[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
  out[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
  out[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];
  out[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
  out[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
  out[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
  out[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];
  out[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
  out[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
  out[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
  out[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

  return out;
}

/** euler to quaternion */
export function etq(r: Vec3, q: Vec4): Vec4 {
  const cr = Math.cos(r.x * 0.5);
  const sr = Math.sin(r.x * 0.5);
  const cp = Math.cos(r.y * 0.5);
  const sp = Math.sin(r.y * 0.5);
  const cy = Math.cos(r.z * 0.5);
  const sy = Math.sin(r.z * 0.5);

  q.x = sr * cp * cy - cr * sp * sy;
  q.y = cr * sp * cy + sr * cp * sy;
  q.z = cr * cp * sy - sr * sp * cy;
  q.w = cr * cp * cy + sr * sp * sy;

  return q;
}

/** mat4 scale, rotate (quaternion) and translate */
export function mat4srqt(m: Mat4, s: Vec3, q: Vec4, t: Vec3, out = m): Mat4 {
  const x = q.x; const y = q.y; const z = q.z; const w = q.w;
  const x2 = x + x; const y2 = y + y; const z2 = z + z; const xx = x * x2;
  const xy = x * y2; const xz = x * z2; const yy = y * y2; const yz = y * z2;
  const zz = z * z2; const wx = w * x2; const wy = w * y2; const wz = w * z2;

  out[0] = (1 - (yy + zz)) * s.x;
  out[1] = (xy + wz) * s.x;
  out[2] = (xz - wy) * s.x;
  out[3] = 0;

  out[4] = (xy - wz) * s.y;
  out[5] = (1 - (xx + zz)) * s.y;
  out[6] = (yz + wx) * s.y;
  out[7] = 0;

  out[8] = (xz + wy) * s.z;
  out[9] = (yz - wx) * s.z;
  out[10] = (1 - (xx + yy)) * s.z;
  out[11] = 0;

  out[12] = t.x;
  out[13] = t.y;
  out[14] = t.z;
  out[15] = 1;

  return out;
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
  fovY: number,
  asp: number,
  near: number,
  far?: number,
  out = mat4()
) {
  const fov = 1.0 / Math.tan(fovY / 2);

  out[0] = fov / asp;
  out[5] = fov;
  out[11] = -1;

  out[1] = out[2] = out[3] = out[4] = out[6] = 0;
  out[7] = out[8] = out[9] = out[15] = 0;

  if (far !== undefined && far !== Infinity) {
    const nf = 1 / (near - far);

    out[10] = (far + near) * nf;
    out[14] = (2 * far * near) * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}