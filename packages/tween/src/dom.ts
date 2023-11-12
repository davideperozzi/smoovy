/* eslint-disable @typescript-eslint/no-unused-vars */
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
  inputValues: Partial<TransformTweenProps>,
  units: Record<string, string> = {}
): void {
  let transform = '';
  const values = { ...inputValues };
  const current = getDomProps(element);

  values.rotateZ = values.rotateZ !== undefined
    ? values.rotateZ
    : (values.rotate !== undefined ? values.rotate : 0);
  values.scaleX = values.scaleX !== undefined
    ? values.scaleX
    : (values.scale !== undefined ? values.scale : 1);
  values.scaleY = values.scaleY !== undefined
    ? values.scaleY
    : (values.scale !== undefined ? values.scale : 1);
  values.scaleZ = values.scaleZ !== undefined
    ? values.scaleZ
    : (values.scale !== undefined ? values.scale : 1);

  if (
    values.x !== undefined ||
    values.y !== undefined ||
    values.z !== undefined
  ) {
    const x = values.x !== undefined ? values.x : current.x;
    const y = values.y !== undefined ? values.y : current.y;
    const z = values.z !== undefined ? values.z : current.z;
    const unitX = units.x || 'px';
    const unitY = units.y || 'px';
    const unitZ = units.z || 'px';

    if (x !== 0 || y !== 0 || z !== 0) {
      current.x = x;
      current.y = y;
      current.z = z;

      transform += ` translate3d(${x}${unitX}, ${y}${unitY}, ${z}${unitZ})`;
    }
  }

  if (values.rotateX !== undefined && values.rotateX !== 0) {
    const unit = units.rotateX || units.rotate || 'deg';

    current.rotateX = values.rotateX;

    transform += ` rotateX(${values.rotateX}${unit})`;
  }

  if (values.rotateY !== undefined && values.rotateY !== 0) {
    const unit = units.rotateY || units.rotate || 'deg';

    current.rotateY = values.rotateY;

    transform += ` rotateY(${values.rotateY}${unit})`;
  }

  if (values.rotateZ !== undefined && values.rotateZ !== 0) {
    const unit = units.rotateZ || units.rotate || 'deg';

    current.rotateZ = values.rotateZ;

    transform += ` rotateZ(${values.rotateZ}${unit})`;
  }

  if (
    values.scaleX !== undefined ||
    values.scaleY !== undefined ||
    values.scaleZ !== undefined
  ) {
    const scaleX = values.scaleX !== undefined ? values.scaleX : current.scaleX;
    const scaleY = values.scaleY !== undefined ? values.scaleY : current.scaleY;
    const scaleZ = values.scaleZ !== undefined ? values.scaleZ : current.scaleZ;

    if (scaleX !== 1 || scaleY !== 1 || scaleZ !== 1) {
      current.scaleX = scaleX;
      current.scaleY = scaleY;
      current.scaleZ = scaleZ;

      transform += ` scale3d(${scaleX}, ${scaleY}, ${scaleZ})`;
    }
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

  return { ...values, opacity: isNaN(opacity) ? 1 : opacity };
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