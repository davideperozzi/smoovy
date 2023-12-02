import { BrowserUrl, parseUrl, serializeUrl } from "@smoovy/utils";

import { Route } from "./route";

export function createRouteFromPath(url: string | BrowserUrl): Route {
  url = typeof url === 'string' ? parseUrl(url) : url;

  return {
    id: generatRouteId(url),
    url: `${url.pathname}${url.search}`,
    hash: url.hash,
    load: serializeUrl(url)
  };
}

export function parseRouteHtml(html: string, selector: string) {
  const element = document.createElement('div');
  element.innerHTML = html;

  const title = element.querySelector('title')?.innerText || '';
  const outlet = element.querySelector<HTMLElement>(selector) || undefined;

  return { outlet, title };
}

export function routesMatch(a: Route, b: Route) {
  return a.url === b.url && a.hash === b.hash;
}

export function generatRouteId(url: BrowserUrl) {
  return window.btoa(`${url.host}${url.pathname}${url.search}${url.hash}`);
}

export function hrefIsValid(href: string) {
  return !href.startsWith('tel:') &&
    !href.startsWith('mailto:') &&
    !href.startsWith('javascript:');
}