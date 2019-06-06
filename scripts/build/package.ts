#!/usr/bin/env bin/ts-node-test
import fs = require('fs');
import rimraf = require('rimraf');
import path = require('path');
import childProcess = require('child_process');

if (typeof process.argv[2] === 'string') {
  const pkgName = process.argv[2];
  const pkgPath = path.resolve('packages', pkgName);
  const distPath = path.join(pkgPath, 'dist');
  const modularFile = path.join(pkgPath, '.modular');
  const distModulesPath = path.join(pkgPath, 'm');

  if ( ! fs.existsSync(pkgPath)) {
    throw new Error(`Package ${pkgName} does not exist`);
  }

  rimraf.sync(distPath);
  console.log(`📦 Building bundles for "${pkgName}":`);

  const buildProcess = childProcess.spawnSync(
    `
      rollup \
        -c ${process.cwd()}/build/rollup.config.js \
        --environment PACKAGE:${pkgPath}
    `,
    {
      shell: true,
      stdio: 'inherit'
    }
  );

  if (buildProcess.status !== 0)  {
    process.exit(buildProcess.status);
  }

  if (fs.existsSync(modularFile)) {
    rimraf.sync(distModulesPath);
    console.log(`🔔 .modular file found!`);
    console.log(`📦 Building modules for "${pkgName}":`);

    const buildModulesProcess = childProcess.spawnSync(
      `
        tsc \
          --project ${pkgPath} \
          --outDir ${distModulesPath}
      `,
      {
        shell: true,
        stdio: 'inherit'
      }
    );

    if (buildModulesProcess.status !== 0)  {
      process.exit(buildModulesProcess.status);
    }
  }
} else {
  throw new Error('No package defined');
}
