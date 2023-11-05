import { TweenController } from '../controller';
import { setDomProps } from '../dom';
import { DOMTweenProps } from '../props';

function setNow<V extends DOMTweenProps & Omit<CSSStyleDeclaration, 'opacity'>>(
  target: HTMLElement,
  props: Partial<V>,
  units?: Record<string, string>
): void;
function setNow<V extends object>(
  target: V,
  props: Partial<V>,
  units?: Record<string, string>
): void;
function setNow<V>(
  target: any,
  props: Partial<any>,
  units?: Record<string, string>
) {
  if (target instanceof HTMLElement) {
    setDomProps(target, props, units);
  } else {
    for (const key in props) {
      target[key as keyof V] = props[key as keyof V] as any;
    }
  }
}

function set<V extends DOMTweenProps & Omit<CSSStyleDeclaration, 'opacity'>>(
  target: HTMLElement,
  props: Partial<V>,
  units?: Record<string, string>
): TweenController;
function set<V extends object>(
  target: V,
  props: Partial<V>,
  units?: Record<string, string>
): TweenController;
function set<V>(
  target: any,
  props: Partial<V>,
  units?: Record<string, string>
) {
  const controller = new TweenController({
    duration: 0.001,
    onStart: () => setNow(target, props, units),
  });

  return controller;
}

export { set, setNow };