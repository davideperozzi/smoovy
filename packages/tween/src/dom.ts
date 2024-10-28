/* eslint-disable @typescript-eslint/no-unused-vars */
import { request } from 'http';
import { DOMTweenProps, TransformTweenProps } from './props';

const transformCache = new WeakMap<HTMLElement, TransformTweenProps>();

export function getTransformValues(element: HTMLElement): TransformTweenProps {
  const cacheItem = transformCache.get(element);

  if (cacheItem) {
    return cacheItem;
  }

  const style = getComputedStyle(element);
  const transform = style.transform;
  const values: TransformTweenProps = {
    x: 0,
    y: 0,
    z: 0,
    opacity: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1
  };

  if (transform && transform !== 'none') {
    const matrixType = transform.includes('3d') ? '3d' : '2d';
    const stringParts = transform.match(/matrix.*\((.+)\)/);

    if ( ! stringParts) {
      return values;
    }

    const matrixValues = stringParts[1].split(', ').map(Number);

    if (matrixType === '2d') {
      const [ a, b, c, d, e, f ] = matrixValues;

      values.x = e;
      values.y = f;
      values.scaleX = Math.sqrt(a * a + b * b);
      values.scaleY = Math.sqrt(c * c + d * d);
      values.rotateZ = Math.atan2(b, a) * (180 / Math.PI);
    } else if (matrixType === '3d') {
      const [
        a1, a2, a3, a4,
        b1, b2, b3, b4,
        c1, c2, c3, c4,
        tx, ty, tz, t4
      ] = matrixValues;

      values.x = tx;
      values.y = ty;
      values.z = tz;
      values.scaleX = Math.sqrt(a1 * a1 + a2 * a2 + a3 * a3);
      values.scaleY = Math.sqrt(b1 * b1 + b2 * b2 + b3 * b3);
      values.scaleZ = Math.sqrt(c1 * c1 + c2 * c2 + c3 * c3);
      values.rotateY = Math.asin(-a3);
      if (Math.cos(values.rotateY) !== 0) {
        values.rotateX = Math.atan2(b3, c3);
        values.rotateZ = Math.atan2(a2, a1);
      } else {
        values.rotateX = 0;
        values.rotateZ = Math.atan2(-b1, b2);
      }

      values.rotateX *= (180 / Math.PI);
      values.rotateY *= (180 / Math.PI);
      values.rotateZ *= (180 / Math.PI);
    }
  }

  values.scale = values.scaleX;
  values.rotate = values.rotateZ;

  transformCache.set(element, values);

  return values;
}

export function setTransformValues(
  element: HTMLElement,
  values: Partial<TransformTweenProps>,
  units: Record<string, string> = {}
): void {
  let transform = '';
  const current = getDomProps(element);

  if (values.x !== undefined) {
    current.x = values.x;
  }

  if (values.y !== undefined) {
    current.y = values.y;
  }

  if (values.z !== undefined) {
    current.z = values.z;
  }

  if (values.scale !== undefined) {
    current.scaleX = values.scale;
    current.scaleY = values.scale;
    current.scaleZ = values.scale;
  }

  if (values.scaleX !== undefined) {
    current.scaleX = values.scaleX;
  }

  if (values.scaleY !== undefined) {
    current.scaleY = values.scaleY;
  }

  if (values.scaleZ !== undefined) {
    current.scaleZ = values.scaleZ;
  }

  if (values.rotate !== undefined) {
    current.rotateZ = values.rotate;
  }

  if (values.rotateX !== undefined) {
    current.rotateX = values.rotateX;
  }

  if (values.rotateY !== undefined) {
    current.rotateY = values.rotateY;
  }

  if (values.rotateZ !== undefined) {
    current.rotateZ = values.rotateZ;
  }

  if (current.x != 0 || current.y != 0 || current.z != 0) {
    transform += ` translate3d(
      ${current.x}${units.x || 'px'},
      ${current.y}${units.y || 'px'},
      ${current.z}${units.z || 'px'}
    )`;
  }

  if (current.rotateX != 0) {
    transform += ` rotateX(${current.rotateX}${units.rotateX || units.rotate || 'deg'})`;
  }

  if (current.rotateY != 0) {
    transform += ` rotateY(${current.rotateY}${units.rotateY || units.rotate || 'deg'})`;
  }

  if (current.rotateZ != 0) {
    transform += ` rotateZ(${current.rotateZ}${units.rotateZ || units.rotate || 'deg'})`;
  }

  if (current.scaleX != 1 || current.scaleY != 1 || current.scaleZ != 1) {
    transform += ` scale3d(${current.scaleX}, ${current.scaleY}, ${current.scaleZ})`;
  }

  element.style.transform = transform.trim();
}

export function mergeDomProps(
  a: DOMTweenProps,
  b: DOMTweenProps
): DOMTweenProps {
  const result = { ...a, ...b };

  if (typeof b.scale !== 'undefined') {
    result.scaleX = b.scale;
    result.scaleY = b.scale;
    result.scaleZ = b.scale;
  }

  if (typeof b.rotate !== 'undefined') {
    result.rotateZ = b.rotate;
  }

  return result;
}

export function getDomProps(dom: HTMLElement) {
  const values = getTransformValues(dom);
  const opacity = parseFloat(dom.style.opacity);

  values.opacity = isNaN(opacity) ? 1 : opacity;

  return values;
}

const noStyleProps = [
   'opacity', 'x', 'y', 'z', 'rotate',
   'rotateX', 'rotateY', 'rotateZ', 'scale',
   'scaleX', 'scaleY', 'scaleZ'
];

export function setDomProps(
  dom: HTMLElement,
  props: Partial<DOMTweenProps & Omit<CSSStyleDeclaration, 'opacity'>>,
  units: Record<string, string> = {}
) {
  setTransformValues(dom, props, units);

  if (typeof props.opacity !== 'undefined') {
    if (props.opacity === 1) {
      dom.style.opacity = '';
    } else {
      dom.style.opacity = props.opacity.toString();
    }
  }

  for (const key in props) {
    if (noStyleProps.includes(key)) {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(props, key)) {
      dom.style[key as any] = props[key as keyof typeof props] as any;
    }
  }
}