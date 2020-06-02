#!/usr/bin/env bin/ts-node
import path = require('path');
import Bundler = require('parcel-bundler');
import express = require('express');

if (
  typeof process.env.TEST_BROWSER_ROOT === 'string' ||
  typeof process.argv[2] === 'string'
) {
  const pkgName = process.argv[2] || '';
  const pkgPath = path.resolve('packages', pkgName);
  const browserRootPath = process.env.TEST_BROWSER_ROOT
    ? process.env.TEST_BROWSER_ROOT
    : path.join(pkgPath, 'tests', 'browser');

    const app = express();
    const port = Number(process.env.TEST_PORT || 1337);
    const host = process.env.TEST_HOST || 'localhost';
    const bundler = new Bundler(path.join(browserRootPath, '*.html'), {
      minify: true,
      watch: false,
      hmr: false,
      bundleNodeModules: true,
      outDir: path.join(process.cwd(), '.dev')
    });

    app.get('/', (req, res, next) => {
      req.url = '/index.html';

      app._router.handle(req, res, next);
    });

    app.use(bundler.middleware()).listen(port, host);

    console.log(`listening at http://${host}:${port}`);
} else {
  throw new Error(`
    You need to pass the package name as arvg1 or define an environment
    variable called "TEST_BROWSER_ROOT" as the root directory for the server
  `);
}
