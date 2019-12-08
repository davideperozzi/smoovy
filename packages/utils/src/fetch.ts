export type GoFetch = (
  ReturnType<typeof fetch> & { controller: AbortController }
);

export function goFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const controller = new AbortController();
  const promise = fetch(
    input,
    Object.assign({ signal: controller.signal }, init)
  ) as GoFetch;

  promise.controller = controller;

  return promise;
}
