export function isDef(val: any) {
  return typeof val !== void 0;
}

export function isNum(val: any) {
  return typeof val === 'number';
}

export function isStr(val: any) {
  return typeof val === 'string';
}

export function isArr(val: any) {
  return Array.isArray(val);
}

export function isObj(val: any) {
  const type = typeof val;

  return type === 'object' && val != null || type === 'function';
}

export function isFunc(val: any) {
  return typeof val === 'function';
}

