#!/usr/bin/env bin/ts-node
import fs = require('fs');
import path = require('path');
import childProcess = require('child_process');

if (typeof process.argv[2] === 'string') {
  const pkgName = process.argv[2];
  const pkgPath = path.resolve('packages', pkgName);
  const demoName = process.argv[3] || 'default';
  const demoPath = path.join(pkgPath, 'demos', demoName);

  if (fs.existsSync(demoPath)) {
    console.log(`🎉 Starting demo "${demoName}" for "${pkgName}"`);

    const parcelProcess = childProcess.spawnSync(
      `
        parcel \
          --no-autoinstall ${path.join(demoPath, 'index.html')} \
          --out-dir ${path.join(process.cwd(), '.dev')} \
          --open
      `,
      {
        shell: true,
        stdio: 'inherit'
      }
    );

    if (parcelProcess.status !== 0) {
      process.exit(parcelProcess.status);
    }
  } else {
    console.log(`The package "${pkgName}" does not have any demos`);
  }
} else {
  throw new Error('No package defined');
}
