export function throttle(
  cb: (...args: any[]) => any,
  ms = 0,
  ctx?: any
): (...args: any[]) => void {
  let lastTime = 0;
  let applyTimeout: any;

  return (...args) => {
    const now = Date.now();

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
