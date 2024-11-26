export type TweenProps = Record<string, number>;
export interface TransformTweenProps {
  x: number;
  y: number;
  z: number;
  opacity: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface DOMTweenProps extends TransformTweenProps {
  opacity: number;
}