export const isDef = <T>(val: T | undefined | null): val is T => val !== undefined;
export const isFunc = (val: any): val is CallableFunction => typeof val === 'function';
export const isNum = (val: any): val is number => typeof val === 'number';
export const isStr = (val: any): val is string => typeof val === 'string';
export const isArray = (val: any): val is Array<any> => Array.isArray(val);
export const isElement = (val: any): val is Element => val instanceof Element;
export const isObj = (val: any): val is Record<any, any> => {
  return val && typeof val === 'object' && !isArray(val) && !isElement(val);
}