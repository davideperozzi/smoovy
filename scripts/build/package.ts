#!/usr/bin/env ts-node --project tsconfig.node.json
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
  childProcess.spawnSync(
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

  if (fs.existsSync(modularFile)) {
    rimraf.sync(distModulesPath);
    console.log(`🔔 .modular file found!`);
    console.log(`📦 Building modules for "${pkgName}":`);
    childProcess.spawnSync(
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
  }
} else {
  throw new Error('No package defined');
}
