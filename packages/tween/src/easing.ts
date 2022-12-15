/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/linear.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const linear = (x: number) => {
  return x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInSine.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInSine = (x: number) => {
  return 1 + Math.sin(Math.PI / 2 * x - Math.PI / 2);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutSine.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutSine = (x: number) => {
  return Math.sin(Math.PI / 2 * x);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutSine.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutSine = (x: number) => {
  return (1 + Math.sin(Math.PI * x - Math.PI / 2)) / 2;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInQuad.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInQuad = (x: number) => {
  return x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutQuad.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutQuad = (x: number) => {
  return x * (2-x);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutQuad.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutQuad = (x: number) => {
  return x < .5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInCubic.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInCubic = (x: number) => {
  return x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutCubic.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutCubic = (x: number) => {
  return (--x) * x * x + 1;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutCubic.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutCubic = (x: number) => {
  return x < .5 ? 4 * x * x * x : (x - 1) * (2 * x - 2) * (2 * x - 2) + 1;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInQuart.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInQuart = (x: number) => {
  return x * x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutQuart.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutQuart = (x: number) => {
  return 1 - (--x) * x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutQuart.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutQuart = (x: number) => {
  return x < .5 ? 8 * x * x * x * x : 1 - 8 * (--x) * x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInQuint.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInQuint = (x: number) => {
  return x * x * x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutQuint.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutQuint = (x: number) => {
  return 1 + (--x) * x * x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutQuint.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutQuint = (x: number) => {
  return x < .5
    ? 16 * x * x * x * x * x
    : 1 + 16 * (--x) * x * x * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInExpo.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInExpo = (x: number) => {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutExpo.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutExpo = (x: number) => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutExpo.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutExpo = (x: number) => {
  return x === 0 ? 0 : x === 1 ? 1 : x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInCirc.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInCirc = (x: number) => {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutCirc.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutCirc = (x: number) => {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutCirc.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutCirc = (x: number) => {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInBack.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return c3 * x * x * x - c1 * x * x;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutBack.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutBack.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutBack = (x: number) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInElastic.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInElastic = (x: number) => {
  return (.04 - .04 / x) * Math.sin(25 * x) + 1;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutElastic.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutElastic = (x: number) => {
  return .04 * x / (--x) * Math.sin(25 * x);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutElastic.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutElastic = (x: number) => {
  return (x -= .5) < 0
    ? (.02 + .01 / x) * Math.sin(50 * x)
    : (.02 - .01 / x) * Math.sin(50 * x) + 1;
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInBounce.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInBounce = (x: number) => {
  return  1 - easeOutBounce(1 - x);
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeOutBounce.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeOutBounce = (x: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

/**
 * ![](https://raw.githubusercontent.com/trenskow/TrAnimate/master/assets/curves/easeInOutBounce.png)
 *
 * Image by [trenskow](https://github.com/trenskow/TrAnimate)
 */
export const easeInOutBounce = (x: number) => {
  return x < 0.5
    ? (1 - easeOutBounce(1 - 2 * x)) / 2
    : (1 + easeOutBounce(2 * x - 1)) / 2;
}