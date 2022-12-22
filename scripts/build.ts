import fg from 'fast-glob';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  // transpile js to ts
  try {
    const files = fg.sync(['./src/**/*.ts'], { absolute: true });
    const output = execSync(
      `yarn run -T esbuild ${files.join(' ')} --outdir=./dist`
    );

    console.log(output.toString('utf-8'));
  } catch(err) {
    console.error((err as any).toString());
    process.exit(1);
  }

  // generate declerations
  if (fs.existsSync('./tsconfig.tsbuildinfo')) {
    fs.rmSync('./tsconfig.tsbuildinfo')
  }

  try {
    execSync(`yarn run -T tsc`);
  } catch(err) {
    const error = err as any;

    if (error.output && Array.isArray(error.output)) {
      const lines = error.output.filter((line: any) => !!line);
      const output = lines.map((line: any) => line.toString('utf-8')).join('\n');

      console.error(output);
      process.exit(1);
    }
  }

  // move general files like README.md etc.
  const copyFiles = ['README.md'];

  copyFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `dist/${file}`);
    }
  });

  // move package json with slight modifications
  const packageJson = require(
    path.join(process.cwd(), 'package.json'),
  );

  if (packageJson.main) {
    packageJson.main = packageJson.main
      .replace(/^\.\/src\//gi, './')
      .replace(/.ts$/gi, '.js');
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'dist/package.json'),
    JSON.stringify(packageJson, undefined, 2)
  );
}

main();