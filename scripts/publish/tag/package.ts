#!/usr/bin/env bin/ts-node
import fs = require('fs');
import path = require('path');
import childProcess = require('child_process');

if (typeof process.argv[2] === 'string') {
  const regex = /@smoovy\/(.*)@.+/;
  const tagName = process.argv[2];

  if (regex.test(tagName)) {
    const tagMatches = tagName.match(regex);

    if (tagMatches && tagMatches[1]) {
      const pkgName = tagMatches[1];
      const pkgPath = path.resolve(process.cwd(), 'packages', pkgName);

      if ( ! fs.existsSync(pkgPath)) {
        throw new Error(`Package "${pkgName}" does not exist`);
      }

      const publishProcess = childProcess.spawnSync(
        `cd ${pkgPath} && npm publish`,
        {
          shell: true,
          stdio: 'inherit'
        }
      );

      if (publishProcess.status !== 0) {
        process.exit(publishProcess.status || 1);
      }
    }
  } else {
    throw new Error(`Invalid tag "${tagName}"`);
  }
} else {
  throw new Error('No tag defined');
}
