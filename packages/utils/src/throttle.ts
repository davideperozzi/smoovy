export function throttle(
  cb: Function,
  ms: number = 0,
  ctx?: any
): (...args: any[]) => void {
  let lastTime = 0;
  let applyTimeout: any;

  return (...args) => {
    const now = (performance || /* istanbul ignore next */ Date).now();

    if (lastTime && now < lastTime + ms) {
      clearTimeout(applyTimeout);

      applyTimeout = setTimeout(function () {
        lastTime = now;
        cb.apply(ctx, args);
      }, ms);
    } else {
      lastTime = now;

      cb.apply(ctx, args);
    }
  };
}
