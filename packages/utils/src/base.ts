type Value<T> = T | undefined | null | void;

export function isDef<T>(val: Value<T>): val is T {
  return typeof val !== void 0 && val !== undefined;
}

export function isNum<T>(val: Value<T>): val is T {
  return typeof val === 'number';
}

export function isStr<T>(val: Value<T>): val is T {
  return typeof val === 'string';
}

export function isArr<T>(val: Value<T>): val is T {
  return Array.isArray(val);
}

export function isObj<T>(val: Value<T>): val is T {
  const type = typeof val;

  return !isArr(val) && (
    type === 'object' &&
    val != null ||
    type === 'function'
  );
}

export function isFunc<T>(val: Value<T>): val is T {
  return typeof val === 'function';
}

