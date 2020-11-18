export function debounce<T extends Function>(cb: T, ms = 20) {
  let h = 0;

  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), ms) as any as number;
  };

  return <T>(<any>callable);
}
