#!/usr/bin/env bin/ts-node
import fs = require('fs');
import rimraf = require('rimraf');
import path = require('path');
import childProcess = require('child_process');

const defaultHost = 'localhost';
const defaultPort = 4023;

if (typeof process.argv[2] === 'string') {
  const ciEnabled = !!process.env.CI;
  const pkgName = process.argv[2];
  const pkgPath = path.resolve('packages', pkgName);
  const testsPath = path.join(pkgPath, 'tests');
  const srcPath = path.join(pkgPath, 'src/**/*.ts');
  const browserTestsPath = path.join(testsPath, 'browser');
  const coverageDirectory = path.join(pkgPath, '.coverage');

  if (fs.existsSync(testsPath)) {
    process.env.TEST_PACKAGE = pkgName;

    if (fs.existsSync(browserTestsPath)) {
      process.env.TEST_HOST = defaultHost;
      process.env.TEST_PORT = defaultPort.toString();
      process.env.TEST_URL = `http://${defaultHost}:${defaultPort}/`;
      process.env.TEST_BROWSER_ROOT = browserTestsPath;
    }

    const jestProcess = childProcess.spawnSync(`
      jest \
      --roots ${pkgPath} \
      --passWithNoTests \
      --runInBand \
      --verbose \
      --coverage \
      --coverageDirectory ${coverageDirectory} \
      --collectCoverageFrom=${path.relative(process.cwd(), srcPath)}
    `,
      {
        shell: true,
        stdio: 'inherit'
      }
    );

    if (jestProcess.status !== 0) {
      process.exit(jestProcess.status);
    }
  }
} else {
  throw new Error('No package defined');
}
