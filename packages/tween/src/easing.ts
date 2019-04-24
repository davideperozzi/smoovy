export type EasingImplementation =
  ((t: number, b: number, c: number, d: number) => number) |
  ((t: number, b: number, c: number, d: number, s?: number) => number);

export const Linear = {
  none: (t: number, b: number, c: number, d: number): number => {
    return c * t / d + b;
  }
}

export const Quad = {
  in: (t: number, b: number, c: number, d: number): number => {
    return c * (t /= d) * t + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return -c * (t /= d) * (t - 2) + b;
  }
};

export const Cubic = {
  in: (t: number, b: number, c: number, d: number): number => {
    return c * (t /= d) * t * t + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  }
}

export const Quart = {
  in: (t: number, b: number, c: number, d: number): number => {
    return c * (t /= d) * t * t * t + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  }
}

export const Quint = {
  in: (t: number, b: number, c: number, d: number): number => {
    return c * (t /= d) * t * t * t * t + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  }
}

export const Sine = {
  in: (t: number, b: number, c: number, d: number): number => {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  }
}

export const Expo = {
  in: (t: number, b: number, c: number, d: number): number => {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  }
}

export const Circ = {
  in: (t: number, b: number, c: number, d: number): number => {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  }
}

export const Back = {
  in: (t: number, b: number, c: number, d: number, s: number = 1.70158): number => {
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  out: (t: number, b: number, c: number, d: number, s: number = 1.70158): number => {
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  }
}

export const Bounce = {
  in: (t: number, b: number, c: number, d: number): number => {
    return c - Bounce.out(d - t, 0, c, d) + b;
  },
  out: (t: number, b: number, c: number, d: number): number => {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
  }
}
