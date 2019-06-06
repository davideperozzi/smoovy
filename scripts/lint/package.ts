#!/usr/bin/env bin/ts-node-test
import path = require('path');
import childProcess = require('child_process');

if (typeof process.argv[2] === 'string') {
  const pkgName = process.argv[2];
  const pkgPath = path.resolve('packages', pkgName);

  console.log(`🔍 Linting code for "${pkgName}"`);

  const lintProcess = childProcess.spawnSync(
    `
      tslint \
        --project ${pkgPath}
    `,
    {
      shell: true,
      stdio: 'inherit'
    }
  );

  if (lintProcess.status !== 0) {
    process.exit(lintProcess.status);
  }
} else {
  throw new Error('No package defined');
}
