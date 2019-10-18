import * as path from 'path';
import * as fs from 'fs';
import autoExternal from 'rollup-plugin-auto-external';
import localResolve from 'rollup-plugin-local-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const pkgPath = process.env.PACKAGE || '';
const pkgRootPath = path.resolve(pkgPath, '..');
const pkgConfigPath = path.join(pkgPath, 'package.json');
const pkgConfig = require(pkgConfigPath);
const inputFile = path.resolve(pkgPath, pkgConfig.source);
const outputPath = path.dirname(path.resolve(pkgPath, pkgConfig.main));
const outputType = path.extname(pkgConfig.main).replace(/^\./, '');
const outputName = path.basename(pkgConfig.main)
  .replace(new RegExp(`\.${outputType}$`), '');

const defaultExternals = (id: string) => {
  return autoExternal({ packagePath: pkgConfigPath })
    .options({ external: [] })
    .external
    .includes(id);
};

const camalize = (str: string) => {
  return str.toLowerCase()
    .replace(
      /[^a-zA-Z0-9]+(.)/g,
      (m: any, chr: string) => chr.toUpperCase()
    );
};

const pkgGlobalNamesArr = fs.readdirSync(pkgRootPath)
  .filter((entry) => {
    const entryPath = path.resolve(pkgRootPath, entry);

    return fs.lstatSync(entryPath).isDirectory();
  })
  .map((entry) => {
    entry = entry.toLowerCase();

    return [
      `@smoovy/${entry}`,
      camalize(`smoovy-${entry}`)
    ];
  });

const pkgGlobalNames: { [name: string]: string } = {};

pkgGlobalNamesArr.forEach(entry => pkgGlobalNames[entry[0]] = entry[1]);

const defaultPlugins = [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigDefaults: {
      exclude: [ 'node_modules', 'tests', '__tests__', 'demos', 'dist' ],
      compilerOptions: {
        declaration: true,
        declarationDir: pkgConfig.types ? path.dirname(pkgConfig.types) : ''
      }
    },
    tsconfig: path.resolve(pkgPath, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        // Remove paths, since we want to use the dist files here
        paths: {}
      }
    }
  }),
  localResolve(),
  terser({
    compress: {
      passes: 3
    }
  })
];

const cjsConfig = {
  format: 'cjs',
  file: path.join(outputPath, `${outputName}.${outputType}`),
  sourcemap: true
};

const esmConfig = {
  format: 'esm',
  file: path.join(outputPath, `${outputName}.esm.${outputType}`),
  sourcemap: true
};

const umdConfig = {
  format: 'umd',
  file: path.join(outputPath, `${outputName}.umd.${outputType}`),
  name: pkgConfig.name,
  sourcemap: true,
  globals: {
    tslib: 'tslib',
    ...pkgGlobalNames
  }
};

export default Promise.resolve(
  [ cjsConfig, esmConfig, umdConfig ].map((output) => ({
    input: inputFile,
    context: 'window',
    external: defaultExternals,
    plugins: [ ...defaultPlugins ],
    output,
  }))
);
