#!/usr/bin/env bin/ts-node-test
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
  const browserTestsPath = path.join(testsPath, 'browser');
  const coverageDirectory = path.join(pkgPath, '.coverage');
  const coverageUploadFile = path.join(coverageDirectory, 'lcov.info');

  if (fs.existsSync(testsPath)) {
    process.env.TEST_PACKAGE = pkgName;

    if (fs.existsSync(browserTestsPath)) {
      process.env.TEST_HOST = defaultHost;
      process.env.TEST_PORT = defaultPort.toString();
      process.env.TEST_URL = `http://${defaultHost}:${defaultPort}/`;
      process.env.TEST_BROWSER_ROOT = browserTestsPath;
    }

    childProcess.spawnSync(
      ciEnabled
        ? `
          jest \
            --roots ${pkgPath} \
            --passWithNoTests \
            --runInBand \
            --verbose \
            --coverage \
            --coverageDirectory ${coverageDirectory}
        `
        : `
          jest \
            --roots ${pkgPath} \
            --passWithNoTests \
            --runInBand
        `
      ,
      {
        shell: true,
        stdio: 'inherit'
      }
    );

    if (ciEnabled) {
      const coverageStats = fs.statSync(coverageUploadFile);

      if (coverageStats.size > 0) {
        console.log('Reporting to coveralls.');
        childProcess.spawnSync(
          `cat ${coverageUploadFile} | coveralls`,
          {
            shell: true,
            stdio: 'inherit'
          }
        );
      } else {
        console.log('Not reporting to coveralls: lcov is empty.');
      }

      rimraf.sync(coverageDirectory);
    }
  } else {
    console.warn(`Skipping tests for "${pkgName}"`);
  }
} else {
  throw new Error('No package defined');
}
