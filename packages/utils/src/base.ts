type Value<T> = T | undefined | null | void;

export const isDef = <T>(val: Value<T>): val is T => val !== undefined;
export const isFunc = <T>(val: Value<T>): val is T => typeof val === 'function';
export const isNum = <T>(val: Value<T>): val is T => typeof val === 'number';
export const isStr = <T>(val: Value<T>): val is T => typeof val === 'string';
export const isArray = <T>(val: Value<T>): val is T => Array.isArray(val);
export const isObj = <T>(val: Value<T>): val is T => {
  const type = typeof val;

  return !isArray(val) && (
    type === 'object' &&
    val != null ||
    type === 'function'
  );
}


