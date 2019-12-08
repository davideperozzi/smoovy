import { Browser } from './browser';

let parser: HTMLAnchorElement;

export interface BrowserUrl {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
}

export function parseUrl(url: string): BrowserUrl {
  if ( ! Browser.client) {
    throw new Error('URL needs to be parse on the client side');
  }

  if ( ! parser) {
    parser = document.createElement('a');
  }

  parser.href = url;

  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    hash: parser.hash
  };
}

export function serializeUrl(url: BrowserUrl) {
  return `${url.protocol}//${url.host}${url.pathname}${url.search}${url.hash}`;
}
