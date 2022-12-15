export function debounce<T extends (...args: any[]) => any>(cb: T, ms = 20) {
  let h = 0;

  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), ms) as any as number;
  };

  return callable as T;
}
