#!/usr/bin/env bin/ts-node
import path = require('path');
import childProcess = require('child_process');

if (
  typeof process.env.TEST_BROWSER_ROOT === 'string' ||
  typeof process.argv[2] === 'string'
) {
  const pkgName = process.argv[2] || '';
  const pkgPath = path.resolve('packages', pkgName);
  const browserRootPath = process.env.TEST_BROWSER_ROOT
    ? process.env.TEST_BROWSER_ROOT
    : path.join(pkgPath, 'tests', 'browser');

  const parcelProcess = childProcess.spawnSync(
    `
      parcel \
        --port ${process.env.TEST_PORT || 1337} \
        --host ${process.env.TEST_HOST || 'localhost'} \
        --out-dir ${path.resolve('.dev')} \
        --no-autoinstall \
      ${browserRootPath}/*.html
    `,
    {
      shell: true,
      stdio: 'inherit'
    }
  );

  if (parcelProcess.status !== 0) {
    process.exit(parcelProcess.status || 1);
  }
} else {
  throw new Error(`
    You need to pass the package name as arvg1 or define an environment
    variable called "TEST_BROWSER_ROOT" as the root directory for the server
  `);
}
