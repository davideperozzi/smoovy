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


/** decomposes a matrix into its components */
export function mat4dec(m: Mat4, p: Vec3, s: Vec3, r: Vec3, q: Vec4) {
  p.x = m[12];
  p.y = m[13];
  p.z = m[14];

  s.x = Math.hypot(m[0], m[1], m[2]);
  s.y = Math.hypot(m[4], m[5], m[6]);
  s.z = Math.hypot(m[8], m[9], m[10]);

  const rotMat = mat4();
  const invScaleX = 1 / s.x;
  const invScaleY = 1 / s.y;
  const invScaleZ = 1 / s.z;

  rotMat[0] = m[0] * invScaleX;
  rotMat[1] = m[1] * invScaleX;
  rotMat[2] = m[2] * invScaleX;
  rotMat[4] = m[4] * invScaleY;
  rotMat[5] = m[5] * invScaleY;
  rotMat[6] = m[6] * invScaleY;
  rotMat[8] = m[8] * invScaleZ;
  rotMat[9] = m[9] * invScaleZ;
  rotMat[10] = m[10] * invScaleZ;

  mat4ToQuat(rotMat, q);
  quatToEuler(q, r);
}

/** inverses the matrix */
export function mat4inv(m: Mat4, out = m): Mat4 {
  const a00 = m[0],  a01 = m[1],  a02 = m[2],  a03 = m[3];
  const a10 = m[4],  a11 = m[5],  a12 = m[6],  a13 = m[7];
  const a20 = m[8],  a21 = m[9],  a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return out;
  }

  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

/** multiply two matrices and output the transformed one */
export function mat4m(m1: Mat4, m2: Mat4, out = m1): Mat4 {
  const a00 = m1[0],  a01 = m1[1],  a02 = m1[2],  a03 = m1[3];
  const a10 = m1[4],  a11 = m1[5],  a12 = m1[6],  a13 = m1[7];
  const a20 = m1[8],  a21 = m1[9],  a22 = m1[10], a23 = m1[11];
  const a30 = m1[12], a31 = m1[13], a32 = m1[14], a33 = m1[15];
  const b00 = m2[0],  b01 = m2[1],  b02 = m2[2],  b03 = m2[3];
  const b10 = m2[4],  b11 = m2[5],  b12 = m2[6],  b13 = m2[7];
  const b20 = m2[8],  b21 = m2[9],  b22 = m2[10], b23 = m2[11];
  const b30 = m2[12], b31 = m2[13], b32 = m2[14], b33 = m2[15];

  out[0]  = a00*b00 + a10*b01 + a20*b02 + a30*b03;
  out[1]  = a01*b00 + a11*b01 + a21*b02 + a31*b03;
  out[2]  = a02*b00 + a12*b01 + a22*b02 + a32*b03;
  out[3]  = a03*b00 + a13*b01 + a23*b02 + a33*b03;
  out[4]  = a00*b10 + a10*b11 + a20*b12 + a30*b13;
  out[5]  = a01*b10 + a11*b11 + a21*b12 + a31*b13;
  out[6]  = a02*b10 + a12*b11 + a22*b12 + a32*b13;
  out[7]  = a03*b10 + a13*b11 + a23*b12 + a33*b13;
  out[8]  = a00*b20 + a10*b21 + a20*b22 + a30*b23;
  out[9]  = a01*b20 + a11*b21 + a21*b22 + a31*b23;
  out[10] = a02*b20 + a12*b21 + a22*b22 + a32*b23;
  out[11] = a03*b20 + a13*b21 + a23*b22 + a33*b23;
  out[12] = a00*b30 + a10*b31 + a20*b32 + a30*b33;
  out[13] = a01*b30 + a11*b31 + a21*b32 + a31*b33;
  out[14] = a02*b30 + a12*b31 + a22*b32 + a32*b33;
  out[15] = a03*b30 + a13*b31 + a23*b32 + a33*b33;

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

export function mat4ToQuat(m: Mat4, out: Vec4): void {
  const trace = m[0] + m[5] + m[10];
  let s;

  if (trace > 0) {
    s = 0.5 / Math.sqrt(trace + 1.0);
    out.w = 0.25 / s;
    out.x = (m[6] - m[9]) * s;
    out.y = (m[8] - m[2]) * s;
    out.z = (m[1] - m[4]) * s;
  } else if (m[0] > m[5] && m[0] > m[10]) {
    s = 2.0 * Math.sqrt(1.0 + m[0] - m[5] - m[10]);
    out.w = (m[6] - m[9]) / s;
    out.x = 0.25 * s;
    out.y = (m[1] + m[4]) / s;
    out.z = (m[2] + m[8]) / s;
  } else if (m[5] > m[10]) {
    s = 2.0 * Math.sqrt(1.0 + m[5] - m[0] - m[10]);
    out.w = (m[8] - m[2]) / s;
    out.x = (m[1] + m[4]) / s;
    out.y = 0.25 * s;
    out.z = (m[6] + m[9]) / s;
  } else {
    s = 2.0 * Math.sqrt(1.0 + m[10] - m[0] - m[5]);
    out.w = (m[1] - m[4]) / s;
    out.x = (m[2] + m[8]) / s;
    out.y = (m[6] + m[9]) / s;
    out.z = 0.25 * s;
  }
}


export function quatToEuler(q: Vec4, out: Vec3): void {
  const x = q.x, y = q.y, z = q.z, w = q.w;
  const sinrCosp = 2 * (w * x + y * z);
  const cosrCosp = 1 - 2 * (x * x + y * y);

  out.x = Math.atan2(sinrCosp, cosrCosp);

  const sinp = 2 * (w * y - z * x);

  if (Math.abs(sinp) >= 1) {
    out.y = Math.sign(sinp) * Math.PI / 2;
  } else {
    out.y = Math.asin(sinp);
  }

  const sinyCosp = 2 * (w * z + x * y);
  const cosyCosp = 1 - 2 * (y * y + z * z);

  out.z = Math.atan2(sinyCosp, cosyCosp);
}

/**
 * Creates a perspective projection matrix.
 *
 * https://github.com/toji/gl-matrix/blob/master/src/mat4.js#L1537-L1563
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


/**
 * Creates a perspective projection matrix.
 *
 * https://github.com/toji/gl-matrix/blob/master/src/mat4.js#L1664C2-L1686C1
 */
export function mat4o(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
  out: Mat4 = mat4(),
) {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;

  return out;
}