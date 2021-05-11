#!/usr/bin/env bin/ts-node
import fs = require('fs');
import path = require('path');
import Bundler = require('parcel-bundler');
import express = require('express');

if (typeof process.argv[2] === 'string') {
  const pkgName = process.argv[2];
  const pkgPath = path.resolve('packages', pkgName);
  const demoName = process.argv[3] || 'default';
  const demoPath = path.join(pkgPath, 'demos', demoName);

  if (fs.existsSync(demoPath)) {
    console.log(`🎉 Starting demo "${demoName}" for "${pkgName}"`);

    const app = express();
    const port = Number(process.env.PORT || 1234);
    const bundler = new Bundler(path.join(demoPath, '*.html'), {
      outDir: path.join(process.cwd(), '.dev')
    });

    app.get('/', (req, res, next) => {
      req.url = '/index.html';
      app._router.handle(req, res, next);
    });

    app.use(bundler.middleware()).listen(port, '0.0.0.0');

    console.log(`listening at http://localhost:${port}`);
  } else {
    console.log(`The package "${pkgName}" does not have any demos`);
  }
} else {
  throw new Error('No package defined');
}
